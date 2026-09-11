# Charger update 2026-09-11

Completed:
- Added ascending/descending straight-line distance sorting from the trip origin, with an explicit approximate-distance label.
- Added official app/download links matched by station name for EV Station PluZ, PEA VOLTA, EVolt, EA Anywhere and ReverSharger.
- Existing route proximity, charging power and rating sorting remain available.
- Lint, production build and diff checks passed.

Remaining:
- Verify mobile layout and external app handoff on physical devices.
- Extend verified provider mappings for other networks. Unknown station brands do not get a guessed app link.
- Distances are geographic estimates, not driving distances or distance travelled along the route.

Open questions: none required for this change.

## Fixed results menu

- Moved scrolling into a separate results region below the right-hand menu.
- Desktop uses remaining panel height; mobile/tablet uses an 80dvh results panel.
- Switching result tabs resets the content scroll position to the top.
- Production build passed. Physical-device scrolling verification remains pending.
- No additional decisions required.
