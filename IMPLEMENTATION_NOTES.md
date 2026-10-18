# UdaanPath page implementation notes

## Updated pages
- `/opportunities`: fetches opportunity records from the existing `GET /api/v1/opportunities/` API, supports search, category, education, state/region and deadline filters, shows eligibility reasons from the existing profile-match results, opens a detail dialog, and links only to valid HTTP(S) official URLs.
- `/roadmap`: uses the existing profile and career recommendations, calls the existing pathway generation API, renders returned milestones/resources, and persists milestone status through the existing status API.

## Integration boundaries
- Opportunity records are displayed from the backend response only; no sample opportunities were added.
- Deadline filters use the backend `deadline` field. Records without a valid deadline are treated as unknown, not open.
- Profile matching continues to use `POST /api/v1/opportunities/match`. Match results are labelled as preliminary and do not guarantee eligibility.
- The provided backend does not expose an opportunity save/bookmark/application-tracking endpoint, so saving/tracking is not represented as implemented.
- The backend opportunity schema currently models scholarship, government scheme and apprenticeship types. The UI includes the requested additional category filters, but those categories will only show records if the backend begins returning those types.
- Student progress and opportunity recommendations require a reachable backend and an existing student profile.

## Validation
- Inspected the existing API client, frontend routing, opportunity/pathway API routes and response schemas before integrating.
- `npm run build` was attempted but could not run to completion because dependency installation was incomplete in this environment (`vite/client` and `@types/node` were unavailable). `npm ci` timed out. No successful production build or browser interaction test is claimed.
- No Git commit, merge, or push was performed.
