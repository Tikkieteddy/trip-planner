# Next Steps for Claude Code

อัปเดต 28 ตุลาคม 2026 | เรียงตามความเสี่ยงและ dependency

1. **Inspect environment setup without exposing secrets.** Compare Vercel/Auth0/Upstash required names with SDK and deployment configuration; report presence only, never values.
2. **Run core route E2E with a test account.** Test one-way and round-trip with map, itinerary, battery summary and charger suggestions. Use a small route and observe Google quota.
3. **Prove Cloud Sync isolation and redirect recovery.** Save, reload, logout/login, second-device and cross-user denial.
4. **Build a real test suite.** Prioritize schemas, route, polyline segmentation, battery and auth/storage handlers; change `npm test` to invoke tests plus build.
5. **Phone QA the complete planner and tutorial.** Check responsive station list, sticky menu, map search collapse, share, app links and footer tooltip.
6. **Ads remain last.** Only after above checks, validate network/provider policy, consent, security/CSP and admin setting behavior.

Do not deploy, push, alter production data, or enable Ads without the user's explicit authorization for that action.
