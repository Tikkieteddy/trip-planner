# Ads admin

CMS page: `/cms`

Legacy admin page `/admin/ads` redirects to `/cms`.

Required Vercel environment variables:

- `ADS_ADMIN_PASSWORD`: admin password with at least 10 characters.
- `ADS_ADMIN_SESSION_SECRET`: random secret with at least 32 characters.
- `UPSTASH_REDIS_REST_URL`: injected by the Upstash Redis integration.
- `UPSTASH_REDIS_REST_TOKEN`: injected by the Upstash Redis integration.

Optional fallback:

- `AD_SCRIPT_HTML_MOBILE`: mobile ad code when Redis is not connected.
- `AD_SCRIPT_HTML_DESKTOP`: desktop ad code when Redis is not connected.
- `AD_SCRIPT_HTML`: legacy shared ad code used for either size if its specific variable is absent.

Fallback variable changes require a deployment. Do not put account secrets in public ad code; the enabled ad code is returned by the public `/api/ads` endpoint.

The public ad slot is 320 x 100 px on mobile and 728 x 90 px from the `sm` breakpoint. Only the code for the active viewport is inserted. The admin session is stored in an HTTP-only, same-site cookie for eight hours. Only an authenticated admin API can write the ad code. Both sizes require code before ads can be enabled. Existing single-script Redis records are read as code for both sizes.

## Work status

Completed:
- Removed the Tikkie Center return button.
- Changed the right results menu to a compact dropdown bar.
- Fixed both left and right menus above independently scrollable content.
- Added responsive ad inventory and an authenticated ads admin page.
- Upgraded Next.js to 16.3.4 and resolved all dependency audit findings.
- Added linked starting-battery inputs for both percent and remaining driving range in kilometers.
- Added `/cms` as the canonical management URL and redirected the previous admin URL to it.
- Kept recommended charging stations visible after adding one to the trip; the chosen station is marked as added, and route recalculation is requested.
- Added mouse-over descriptions to planner, map, place-search, and CMS buttons.
- Verified the charger flow with a live public route: 10 recommendations remain visible after one is added. Fixed the itinerary menu count after route invalidation.
- Rechecked production after deployment: adding a charger keeps 10 recommendations and shows 3 itinerary stops. Simulated viewport checks measured the ad slot at 320 x 100 px on mobile and 728 x 90 px on desktop.
- Audited Production environment variable names: only the two Google Maps keys were present. The CMS now reports missing setup explicitly and disables login until its two authentication secrets are configured.
- Added separate mobile and desktop ad code fields, an inert size preview, and server validation before enabling ads.

Remaining:
- Connect Upstash Redis and add the admin password/session secret in Vercel.
- Add a real ad network script and verify its provider-specific rendering policy.
- Verify the 320 x 100 layout on a physical mobile device.

Open questions:
- Which ad network will supply the production script?
