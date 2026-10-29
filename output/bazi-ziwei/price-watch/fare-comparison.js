function priced(item, basis, currency) {
  if (!item || item.journeyType !== "multicity" || item.itineraryComplete !== true
    || item.currency !== currency || !Number.isFinite(item.price) || item.price <= 0
    || !Array.isArray(item.legs) || item.legs.length < 2) return false;
  if (basis === "through") return item.separateTickets !== true && item.priceBasis === "whole_itinerary_quote"
    && item.bookingQuote?.basis === "provider_together_offer"
    && item.bookingQuote.currency === currency && Number.isFinite(item.bookingQuote.price)
    && Math.abs(item.bookingQuote.price - item.price) < 1;
  return item.separateTickets === true && item.priceBasis === "separate_ticket_sum"
    && item.legs.every((leg) => Number.isFinite(leg.price) && leg.price > 0)
    && Math.abs(item.legs.reduce((sum, leg) => sum + leg.price, 0) - item.price) < 1;
}

function flightSignature(item) {
  return JSON.stringify([item.cabinClass, item.cabinLabel, item.mixedCabin, (item.segments || []).map((segment) => [
    String(segment.flightNumber || "").replace(/[\s-]/g, "").toUpperCase(),
    segment.departureAirport, segment.departureTime, segment.arrivalAirport, segment.arrivalTime, segment.travelClass,
  ])]);
}

export function compareFares(view) {
  const offers = [...(view.results || []), ...(view.separateResults || [])];
  const lowest = (basis) => offers.filter((item) => priced(item, basis, view.currency))
    .sort((a, b) => a.price - b.price)[0] || null;
  const through = lowest("through");
  const separate = lowest("separate");
  const cheapest = through && separate ? through.price <= separate.price ? through : separate : through || separate;
  return { through, separate, cheapest,
    difference: through && separate ? Math.abs(through.price - separate.price) : null,
    sameFlights: Boolean(through && separate && through.segments?.length && separate.segments?.length
      && flightSignature(through) === flightSignature(separate)),
    complete: Boolean(through && separate) };
}
