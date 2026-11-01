import io
import json
import tempfile
import unittest
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import a7_leju_digest as digest
from fetch_policy import FetchBlocked, FetchHTTPError, FetchPolicy, check_response, retry_delay

URL = "https://www.leju.com.tw/map/region?sid=11175"


class FetchPolicyTests(unittest.TestCase):
    def test_retry_after_seconds_and_http_date(self):
        now = 1800000000
        future = format_datetime(datetime.fromtimestamp(now+123, timezone.utc), usegmt=True)
        self.assertEqual(retry_delay("123", now), 123)
        self.assertEqual(retry_delay(future, now), 123)
        for bad in ["-5", "1e309", "nan", "", "nonsense"]:
            self.assertEqual(retry_delay(bad, now), 900)
        self.assertEqual(retry_delay("0", now), 0)

    def test_429_stops_alternate_clients_and_subareas_but_not_official(self):
        policy = FetchPolicy()
        primary = Mock(side_effect=FetchBlocked("HTTP 429", "900"))
        alternate = Mock(return_value="wrong")
        with self.assertRaises(FetchBlocked):
            policy.fetch(URL, [primary, alternate])
        with self.assertRaises(FetchBlocked):
            policy.fetch("https://leju.com.tw/community_list?sid=11176", [alternate])
        primary.assert_called_once()
        alternate.assert_not_called()
        self.assertEqual(policy.fetch("https://plvr.land.moi.gov.tw/Download", [lambda _: b"PK"]), b"PK")
        self.assertEqual(policy.diagnostics()[0]["deferred"], 1)

    def test_parallel_callers_share_one_host_stop(self):
        policy = FetchPolicy()
        fetcher = Mock(side_effect=FetchBlocked("HTTP 403"))
        def attempt(i):
            try:
                policy.fetch(URL + f"&i={i}", [fetcher])
            except FetchBlocked:
                return True
        with ThreadPoolExecutor(max_workers=5) as pool:
            self.assertTrue(all(pool.map(attempt, range(5))))
        fetcher.assert_called_once()

    def test_persists_no_page_or_secret_and_honors_next_run_cooldown(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"policy.json"
            clock = Mock(return_value=1000)
            first = FetchPolicy(path, clock=clock)
            with self.assertRaises(FetchBlocked):
                first.fetch(URL+"&token=secret", [Mock(side_effect=FetchBlocked("HTTP 429", "600"))])
            self.assertNotIn("secret", path.read_text())
            self.assertEqual(json.loads(path.read_text())["leju.com.tw"]["until"],1600)
            next_run = FetchPolicy(path, clock=clock)
            fetcher = Mock(return_value="fresh")
            with self.assertRaises(FetchBlocked):
                next_run.fetch(URL, [fetcher])
            fetcher.assert_not_called()
            clock.return_value = 1601
            self.assertEqual(next_run.fetch(URL, [fetcher]), "fresh")

    def test_checks_http_status_even_when_body_is_not_empty(self):
        for status in [401,403,429,503]:
            with self.assertRaises(FetchBlocked):
                check_response(status, {"Retry-After":"120"}, "<html>busy</html>")
        with self.assertRaises(FetchHTTPError):
            check_response(404, {}, "<html>missing</html>")
        for headers, body in [({"Cf-Mitigated":"challenge"}, "blocked"),
                              ({}, "<html>cf-chl-test</html>")]:
            with self.assertRaises(FetchBlocked):
                check_response(200,headers,body)
        check_response(200, {}, "article mentioning cf_clearance without a challenge")

    def test_paces_fallback_and_reuses_only_current_run_success(self):
        clock = Mock(return_value=100)
        sleep = Mock()
        policy = FetchPolicy(clock=clock, sleep=sleep)
        fallback = Mock(return_value="fresh")
        self.assertEqual(policy.fetch(URL, [Mock(side_effect=TimeoutError()), fallback]), "fresh")
        sleep.assert_called_once_with(2)
        self.assertEqual(policy.fetch(URL, [fallback]), "fresh")
        fallback.assert_called_once()
        new_run = FetchPolicy(clock=clock, sleep=sleep)
        new_run.fetch(URL, [fallback])
        self.assertEqual(fallback.call_count,2)

    def test_curl_reads_final_status_and_retry_after(self):
        def fake(args, **kwargs):
            Path(args[args.index("--dump-header")+1]).write_text("HTTP/1.1 302 Found\nRetry-After: 1\n\nHTTP/2 429\nRetry-After: 700\n\n")
            Path(args[args.index("--output")+1]).write_bytes(b"<html>busy</html>")
            return SimpleNamespace(returncode=0, stdout="429")
        with patch.object(digest.subprocess, "run", side_effect=fake):
            with self.assertRaises(FetchBlocked) as ctx:
                digest.fetch_text_with_curl(URL)
        self.assertEqual(ctx.exception.retry_after, "700")

    def test_proxy_http_errors_are_not_swallowed(self):
        error = urllib.error.HTTPError(URL,429,"busy",{"Retry-After":"90"},io.BytesIO(b"busy"))
        with patch.dict(digest.os.environ,{"LEJU_FETCH_PROXY_URL":"https://proxy.example/fetch"}), patch.object(digest.urllib.request,"urlopen",side_effect=error):
            with self.assertRaises(FetchBlocked) as ctx:
                digest.fetch_text_with_proxy(URL)
        self.assertEqual(ctx.exception.retry_after,"90")

    def test_digest_fetch_routes_only_transport_errors_to_fallback(self):
        with patch.object(digest,"FETCH_POLICY",FetchPolicy()), patch.dict(digest.os.environ,{"LEJU_FETCH_PROXY_URL":""}), patch.object(digest,"fetch_text_with_curl_cffi",side_effect=FetchBlocked("HTTP 429")), patch.object(digest,"fetch_text_with_curl") as curl, patch.object(digest,"fetch_text_with_playwright") as browser:
            with self.assertRaises(FetchBlocked):
                digest.fetch_text(URL)
            curl.assert_not_called()
            browser.assert_not_called()

    def test_wrapped_proxy_429_and_challenge_stop_origin(self):
        for payload in [{"status":429,"retry_after":"180","error":"Leju returned HTTP 429"},
                        {"status":200,"error":"Leju returned Cloudflare challenge"}]:
            error = urllib.error.HTTPError(URL,502,"upstream",{"Content-Type":"application/json"},
                                           io.BytesIO(json.dumps(payload).encode()))
            with patch.dict(digest.os.environ,{"LEJU_FETCH_PROXY_URL":"https://proxy.example/fetch"}), patch.object(digest.urllib.request,"urlopen",side_effect=error):
                with self.assertRaises(FetchBlocked):
                    digest.fetch_text_with_proxy(URL)

    def test_cffi_and_browser_reject_nonempty_429_pages(self):
        import sys
        response = SimpleNamespace(status_code=429, headers={"Retry-After":"75"}, text="<html>busy</html>")
        fake_requests = SimpleNamespace(get=Mock(return_value=response))
        with patch.dict(sys.modules, {"curl_cffi": SimpleNamespace(requests=fake_requests)}):
            with self.assertRaises(FetchBlocked) as ctx:
                digest.fetch_text_with_curl_cffi(URL)
        self.assertEqual(ctx.exception.retry_after,"75")
        page = Mock()
        page.goto.return_value = SimpleNamespace(status=429, headers={"Retry-After":"75"})
        page.content.return_value = "<html>busy</html>"
        browser = Mock()
        browser.new_context.return_value.new_page.return_value = page
        manager = Mock()
        manager.__enter__ = Mock(return_value=SimpleNamespace(chromium=SimpleNamespace(launch=Mock(return_value=browser))))
        manager.__exit__ = Mock(return_value=False)
        with patch.dict(sys.modules,{"playwright.sync_api":SimpleNamespace(sync_playwright=lambda:manager)}):
            with self.assertRaises(FetchBlocked):
                digest.fetch_text_with_playwright(URL)
        page.wait_for_timeout.assert_not_called()
        browser.close.assert_called_once()

    def test_cooldown_write_failure_still_stops_current_run(self):
        policy = FetchPolicy()
        policy.state_path = Path("unused")
        with patch.object(Path,"mkdir",side_effect=PermissionError()):
            with self.assertRaises(FetchBlocked):
                policy.fetch(URL,[Mock(side_effect=FetchBlocked("HTTP 429"))])
        fetcher=Mock()
        with self.assertRaises(FetchBlocked):
            policy.fetch(URL,[fetcher])
        fetcher.assert_not_called()


if __name__ == "__main__":
    unittest.main()
