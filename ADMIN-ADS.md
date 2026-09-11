# Ads admin

Admin page: `/admin/ads`

Required Vercel environment variables:

- `ADS_ADMIN_PASSWORD`: admin password with at least 10 characters.
- `ADS_ADMIN_SESSION_SECRET`: random secret with at least 32 characters.
- `UPSTASH_REDIS_REST_URL`: injected by the Upstash Redis integration.
- `UPSTASH_REDIS_REST_TOKEN`: injected by the Upstash Redis integration.

Optional fallback:

- `AD_SCRIPT_HTML`: ad network script used when Redis is not connected. Changes to this value require a deployment.

The public ad slot is 320 x 100 px on mobile and 728 x 90 px from the `sm` breakpoint. The admin session is stored in an HTTP-only, same-site cookie for eight hours. Only an authenticated admin API can write the ad script.

## Work status

Completed:
- Removed the Tikkie Center return button.
- Changed the right results menu to a compact dropdown bar.
- Fixed both left and right menus above independently scrollable content.
- Added responsive ad inventory and an authenticated ads admin page.
- Upgraded Next.js to 16.3.4 and resolved all dependency audit findings.

Remaining:
- Connect Upstash Redis and add the admin password/session secret in Vercel.
- Add a real ad network script and verify its provider-specific rendering policy.
- Verify the 320 x 100 layout on a physical mobile device.

Open questions:
- Which ad network will supply the production script?
