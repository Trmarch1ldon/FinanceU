/** A player's ticker: the first four letters of their handle, capitalised — "thomas" → THOM. */
export const tickerFor = (handle: string) =>
  handle
    .replace(/[^a-z]/gi, "")
    .slice(0, 4)
    .toUpperCase() || "ANON";
