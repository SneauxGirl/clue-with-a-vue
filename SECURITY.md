# Security Notes

Mocked, no-backend portfolio project. Notes on the choices made:

## Input validation

`isValidIPv4()` / `InvalidIPError` (`shared/ip.ts`) validate the IP string before
it reaches the mock fetch layer, and both domain fetch functions re-check as a guard.
Invalid input is rejected with `Invalid IP address. Format: 192.168.1.1`.

## API response validation

Both mock fetches parse their responses through a zod schema (`ipAnalysisSchema`,
`fraudEventsResultSchema`) before returning them, demonstrating a necessary filter for API
mismatch. A bad shape throws `IPAnalysisFetchError` / `FraudEventsFetchError`.

## No sensitive data in localStorage

Filter state and fetched fraud data live in memory (Vue refs / TanStack Query cache)
and are gone on refresh, by design.

## CSP

<!-- TODO security: add vercel.json Content-Security-Policy before public deploy; test ECharts tooltip inline styles (report-only first). -->

Set before deployment. Specifically, ECharts renders tooltips as DOM nodes with
inline styles, so a strict `style-src` has to be tested, not assumed.

## Non-goals

- No auth — out of scope for a single-page mock.
- No real network calls to secure; `simulateNetworkDelay()` is a `setTimeout`.
- CORS and rate limiting are server-side — nothing to do here without a backend.
