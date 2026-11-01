"""Host-scoped pacing and circuit breaking; never stores page content."""
import json
import math
import threading
import time
from datetime import timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlsplit


class FetchBlocked(RuntimeError):
    def __init__(self, reason, retry_after=""):
        self.reason = reason
        self.retry_after = retry_after
        super().__init__(f"source paused: {reason}; no alternate transport or retry in this run")


class FetchHTTPError(RuntimeError):
    pass


def retry_delay(value, now, default=900):
    value = str(value or "").strip()
    if value.isascii() and value.isdecimal():
        try:
            result = float(value)
            return result if math.isfinite(result) else default
        except ValueError:
            return default
    try:
        stamp = parsedate_to_datetime(value)
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=timezone.utc)
        return max(0, stamp.timestamp() - now)
    except (ValueError, TypeError, OverflowError):
        return default


def host_key(url):
    host = (urlsplit(url).hostname or "").lower()
    return "leju.com.tw" if host in {"leju.com.tw", "www.leju.com.tw"} else host


def challenge_page(text):
    lower = text.lower()
    return ("just a moment" in lower and "challenges.cloudflare.com" in lower) or "cf-chl" in lower


def check_response(status, headers, text=""):
    headers = {str(k).lower(): str(v) for k, v in headers.items()}
    after = headers.get("retry-after", "")
    if status == 429:
        raise FetchBlocked("HTTP 429", after)
    if headers.get("cf-mitigated", "").lower() == "challenge" or challenge_page(text):
        raise FetchBlocked("Cloudflare challenge", after)
    if status in (401, 403):
        raise FetchBlocked(f"HTTP {status}", after)
    if status >= 400 and after:
        raise FetchBlocked(f"HTTP {status}", after)
    if status >= 400:
        raise FetchHTTPError(f"HTTP {status}; response is not usable page data")
    if not 200 <= status < 300:
        raise FetchHTTPError(f"Unexpected HTTP {status}")


class FetchPolicy:
    def __init__(self, state_path=None, clock=None, sleep=None):
        self.clock = clock or time.time
        self.sleep = sleep or time.sleep
        self.state_path = Path(state_path) if state_path else None
        self.lock = threading.Lock()
        self.host_locks = {}
        self.stopped = {}
        self.last_finished = {}
        self.cooldowns = {}
        self.stats = {}
        self.responses = {}
        if self.state_path and self.state_path.exists():
            try:
                values = json.loads(self.state_path.read_text(encoding="utf-8"))
                for host, item in values.items():
                    until = float(item["until"])
                    if math.isfinite(until) and until > self.clock():
                        self.cooldowns[host] = {"until": until, "reason": str(item["reason"])[:80]}
            except (OSError, ValueError, TypeError, KeyError, AttributeError):
                print("Fetch policy state could not be read; using current-run protection.")

    def _stop(self, host, error):
        now = self.clock()
        default = 900 if error.reason == "HTTP 429" else 3600
        with self.lock:
            self.stopped[host] = error
            self.cooldowns[host] = {"until": now + retry_delay(error.retry_after, now, default), "reason": error.reason}
            if self.state_path:
                try:
                    self.state_path.parent.mkdir(parents=True, exist_ok=True)
                    temporary = self.state_path.with_suffix(".tmp")
                    temporary.write_text(json.dumps(self.cooldowns), encoding="utf-8")
                    temporary.replace(self.state_path)
                except OSError:
                    print("Fetch cooldown could not be saved; current-run protection remains active.")

    def fetch(self, url, fetchers):
        host = host_key(url)
        with self.lock:
            lock = self.host_locks.setdefault(host, threading.Lock())
        # Threads for the same origin cannot race past a new server restriction.
        with lock:
            stat = self.stats.setdefault(host, {"requests": 0, "deferred": 0, "reused_current_run": 0})
            if url in self.responses:
                stat["reused_current_run"] += 1
                return self.responses[url]
            cached = self.cooldowns.get(host, {})
            if host in self.stopped or cached.get("until", 0) > self.clock():
                stat["deferred"] += 1
                reason = self.stopped[host].reason if host in self.stopped else cached["reason"]
                raise FetchBlocked(reason)
            with self.lock:
                self.cooldowns.pop(host, None)
            errors = []
            for fetcher in fetchers:
                interval = 2.0 if host == "leju.com.tw" else .25
                wait = interval - (self.clock() - self.last_finished.get(host, -float("inf")))
                if wait > 0:
                    self.sleep(wait)
                stat["requests"] += 1
                try:
                    result = fetcher(url)
                    self.responses[url] = result
                    return result
                except FetchBlocked as error:
                    self._stop(host, error)
                    raise
                except FetchHTTPError:
                    raise
                except Exception as error:
                    # Only transport failures may try another client. Never log
                    # proxy URLs, tokens or arbitrary server response bodies.
                    kind = type(error).__name__
                    errors.append("timeout" if "timeout" in kind.lower() or "timedout" in kind.lower() else kind)
                finally:
                    self.last_finished[host] = self.clock()
            raise RuntimeError("fetch transports failed: " + ", ".join(errors))

    def diagnostics(self):
        return [{"host": host, **value, "stop_reason": self.stopped[host].reason if host in self.stopped else self.cooldowns.get(host, {}).get("reason", "")}
                for host, value in self.stats.items()]
