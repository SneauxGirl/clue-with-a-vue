# Architecture Decisions

## TanStack Query for server state, `ref()` for UI state

`useIPAnalysis` and `useFraudEvents` own everything server-derived. UI state stays local: `outcomeFilter` and `groupByCategory` in `App.vue`, sort in `FraudEventTable.vue`. 

TanStack has come up in several conversations this week so I used this as an excuse to build with it. It's lovely, and the component rerenders stay contained.

## vue-echarts

I chose vue-echarts over vue-chartjs for better customization and headroom, but that comes with a pricetag: echarts is roughly 200 kB gzipped of a 237 kB bundle on this one-page-wonder. The chart is the app, by weight. It's overkill on a demo, but the dependency pays for itself the moment project scope expands.

## Folder structure: domain-first, not type-first

`src/domains/<domain>/` keeps a business concept together — types, queries, and whatever else it needs (`transforms.ts` for fraud-events, `services.ts` for ip-analysis). Cross-domain input helpers live in `src/shared/` (e.g. `ip.ts`) so domains don't import each other. `src/ui/` holds the shared primitives (Button, Card, Badge) and the page shell. `config/mock-data.ts` attaches throughout for demo only.

## No automatic query retries

`queryClient`'s `retry` is `false`. `InvalidIPError`, `IPAnalysisFetchError` and `FraudEventsFetchError` are all deliberate outcomes — there's no flaky connection for a retry to rescue, so it would just delay the error UI by a second or two with no other return. The manual "Retry" in `ErrorAlert` calls `refetch()` on demand.

## Deterministic mock data, not a fixed fixture list

`config/mock-data.ts` seeds a small PRNG from a hash of the IP, so the same IP always gets the same analysis and the same event mix. Timestamps hang off `asOf` at fetch time, so absolute times move on a later search. Preset IPs override with repeatable clean/risky examples (risky ones use RFC 5737 ranges). `0.0.0.0` always fails the mock fetch.

## Performance

The table renders every matching row — no virtualization, no inner scroll container. It was a choice to focus on other complexities, while ensuring screen readers and find-in-screen function well.
