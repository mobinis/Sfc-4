# THIRD-PARTY SOFTWARE NOTICES

This file documents all third-party open-source libraries used in **Self-Care Hero**, their purpose, version, license, and repository links. Every dependency complies with the project's strict offline-first requirements (no telemetry, no tracking, no CDNs, no remote assets, no external API calls).

---

## Production Dependencies

| Package Name | Exact / Pinned Version | License | Link / Source | Purpose in Self-Care Hero | Offline Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `react` | `^19.0.1` | MIT | [github.com/facebook/react](https://github.com/facebook/react) | UI view rendering and state reconciliation engine | Yes (bundled locally) |
| `react-dom` | `^19.0.1` | MIT | [github.com/facebook/react](https://github.com/facebook/react) | DOM renderer for React web application | Yes (bundled locally) |
| `motion` | `^12.23.24` | MIT | [github.com/motiondivision/motion](https://github.com/motiondivision/motion) | Smooth UI transitions, gesture spring animations | Yes (bundled locally) |
| `lucide-react` | `^0.546.0` | ISC | [github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide) | Vector icons rendered as pure inline SVG elements | Yes (zero external network assets) |
| `adhan` | `^4.4.6` | MIT | [github.com/batoulapps/adhan-js](https://github.com/batoulapps/adhan-js) | Pure astronomical trigonometric math for offline prayer schedule calculation | Yes (100% offline math, zero network calls) |
| `@capacitor/core` | `^6.2.2` | MIT | [github.com/ionic-team/capacitor](https://github.com/ionic-team/capacitor) | Native Android bridge runtime for packaging into installable APK | Yes (local native container) |
| `@capacitor/local-notifications` | `^6.1.3` | MIT | [github.com/ionic-team/capacitor-plugins](https://github.com/ionic-team/capacitor-plugins) | Native high-importance Android alarms & notifications firing while app is closed | Yes (local OS notification manager) |
| `tailwindcss` | `^4.3.3` | MIT | [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Utility-first CSS styling engine | Yes (compiled ahead-of-time) |
| `@tailwindcss/vite` | `^4.3.3` | MIT | [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Vite integration plugin for Tailwind CSS v4 | Yes (build-time only) |
| `@vitejs/plugin-react` | `^6.1.1` | MIT | [github.com/vitejs/vite-plugin-react](https://github.com/vitejs/vite-plugin-react) | Fast React JSX compilation and optimization plugin for Vite | Yes (build-time only) |
| `vite` | `^8.3.0` | MIT | [github.com/vitejs/vite](https://github.com/vitejs/vite) | Frontend bundling and local development server | Yes (build-time only) |

---

## Development Dependencies

| Package Name | Version | License | Purpose |
| :--- | :--- | :--- | :--- |
| `typescript` | `^5.8.2` | Apache-2.0 | Static type checking and compiler verification |
| `@types/react` | `^19.3.0` | MIT | TypeScript type definitions for React |
| `@types/react-dom` | `^19.3.0` | MIT | TypeScript type definitions for React DOM |
| `@types/node` | `^22.14.0` | MIT | TypeScript type definitions for Node.js |
| `autoprefixer` | `^10.4.21` | MIT | PostCSS vendor prefixing tool |

---

## Compliance & Governance Notes
1. **Permitted Licenses Only**: All active dependencies use permissive licenses (`MIT`, `Apache-2.0`, `ISC`). No `GPL`, `AGPL`, or proprietary restrictive licenses.
2. **100% Offline Integrity**: No dependency initiates network requests, tracking beacons, analytics scripts, or remote font/image requests.
3. **Encapsulation Pattern**: Each external capability (e.g. notifications, audio synthesis, prayer calculation) is isolated in our own wrapper modules (`src/utils/notifications.ts`, `src/utils/audio.ts`) with clear fallbacks.
