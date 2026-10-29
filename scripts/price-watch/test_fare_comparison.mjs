import assert from "node:assert/strict";
import test from "node:test";
import { compareFares } from "../../output/bazi-ziwei/price-watch/fare-comparison.js";

const leg = (price) => ({ price });
const base = { journeyType: "multicity", itineraryComplete: true, currency: "TWD", cabinClass: "economy",
  segments: [{ flightNumber: "MU 100", departureAirport: "TPE", departureTime: "2027-01-05 09:00", arrivalAirport: "PVG", arrivalTime: "2027-01-05 11:00" }] };
const through = (price) => ({ ...base, price, priceBasis: "whole_itinerary_quote", separateTickets: false,
  bookingQuote: { basis: "provider_together_offer", currency: "TWD", price }, legs: [leg(0), leg(0)] });
const separate = (price) => ({ ...base, price, priceBasis: "separate_ticket_sum", separateTickets: true,
  legs: [leg(price / 2), leg(price / 2)] });

test("compares only verified whole-ticket and complete separate totals", () => {
  const view = { currency: "TWD", results: [through(18000), through(16000)], separateResults: [separate(15000), separate(17000)] };
  const result = compareFares(view);
  assert.equal(result.through.price, 16000);
  assert.equal(result.separate.price, 15000);
  assert.equal(result.cheapest, result.separate);
  assert.equal(result.difference, 1000);
  assert.equal(result.sameFlights, true);
  assert.equal(result.complete, true);
});

test("missing, zero, wrong-currency and incomplete quotes never become winners", () => {
  const view = { currency: "TWD", results: [{ ...through(0), price: 0 },
    { ...through(1), bookingQuote: undefined }, { ...through(2), currency: "USD" },
    { ...through(3), bookingQuote: { ...through(3).bookingQuote, currency: "USD" } }],
  separateResults: [{ ...separate(3), legs: [leg(3), leg(0)] }, separate(12000)],
  unpricedResults: [through(500)] };
  const result = compareFares(view);
  assert.equal(result.through, null);
  assert.equal(result.cheapest.price, 12000);
  assert.equal(result.complete, false);
  assert.equal(result.difference, null);
});

test("different flights cannot be presented as an exact fare comparison", () => {
  const result = compareFares({ currency: "TWD", results: [through(14000)],
    separateResults: [{ ...separate(16000), segments: [{ ...base.segments[0], flightNumber: "MU 101" }] }] });
  assert.equal(result.cheapest.price, 14000);
  assert.equal(result.sameFlights, false);
});
