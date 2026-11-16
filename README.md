# JX-ESHAARE Intelli-Platform

Consolidated monorepo for the JX (JARVIS X) ecosystem — Eshaare Tours' AI-powered tourism
technology platform — plus the automation tooling, dashboards, and research components that
feed into it.

Isolated cloud engineering environment. Supports architecture validation, secure development,
automated testing, travel and visa workflows, CRM, supplier integrations, and client portals.
**No production changes without explicit approval.**

## Repository layout

| Directory | Description |
|---|---|
| [`dashboard-workflow-monitoring/`](dashboard-workflow-monitoring/) | Workflow Monitoring Dashboard (Community) — React + Vite code bundle generated from [this Figma design](https://www.figma.com/design/Sj6TgF3cgbt3vv5vytZl1W/Workflow-Monitoring-Dashboard--Community-). Run with `npm i && npm run dev`. |
| [`jarvis-desktop-satellite/`](jarvis-desktop-satellite/) | JARVIS Desktop Satellite agents (Wayland) — FastAPI services exposing screenshot / click / type / move desktop-control endpoints. Two variants: `satellite_pyautogui.py` and `satellite_ydotool.py` (port 8001). |
| [`bls-appointment-bot/`](bls-appointment-bot/) | BLS Morocco Appointment Bot — Selenium + TeleBot visa appointment automation (booking, calendar, Gmail OTP retrieval, payment receipt catcher). See its README for setup. |
| [`bls-algeria-selfie-bypass/`](bls-algeria-selfie-bypass/) | BLS Algeria appointment automation notes (async slot detection, booking flow). README-only reference. |
| [`bls-cpi-scraper/`](bls-cpi-scraper/) | BLS CPI Data Scraper — .NET Playwright Windows service that scrapes U.S. CPI figures into SQL Server. |
| [`vfs-appointment-bot/`](vfs-appointment-bot/) | make-appointment-vfsglobal — Selenium bot for visa.vfsglobal.com (Turkey). Reads applicant records from `kayitlar/*.txt`; plays `uyari.wav` on slot detection. |
| [`supertonic-tts-examples/`](supertonic-tts-examples/) | Supertonic 3 TTS ONNX Runtime examples: C++ (`cpp/`), C# (`csharp/`), and Flutter (`flutter/`). |
| [`security-pocs/crushftp-cve-2024-4040/`](security-pocs/crushftp-cve-2024-4040/) | Public PoC for CVE-2024-4040 (CrushFTP SSTI). **For authorized security testing and defensive validation only.** |

## Notes

- Bots read credentials at runtime from local files or chat input — no secrets are stored in
  this repository. Never commit real credentials, tokens, or applicant data.
- `vfs-appointment-bot/` expects a `kayitlar/` directory with applicant records; see its README.
- The dashboard bundle requires Node.js; the satellites require Python with `fastapi`,
  `uvicorn`, `pydantic`, and either `pyautogui` or `ydotool` on the host.
