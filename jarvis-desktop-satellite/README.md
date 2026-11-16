# JARVIS Desktop Satellite (Wayland)

FastAPI micro-services that expose desktop-control endpoints for the JARVIS agent stack.
Run on a Linux machine with a Wayland session; both variants listen on port **8001**.

## Endpoints

- `GET /health` — status probe (`{"status": "online", "device": "office-x8664", "session": "wayland"}`)
- `POST /api/v1/desktop/execute` — body: `{"action": "...", "target": "...", "coordinates": {"x": 0, "y": 0}}`

Supported actions: `screenshot` (returns base64 PNG via `grim`), `click`, `type`, `move`
(`move` only in the pyautogui variant).

## Variants

| File | Input backend | Notes |
|---|---|---|
| `satellite_pyautogui.py` | `pyautogui` (XWayland) | `FAILSAFE` enabled — slam the mouse to the top-left corner to abort. |
| `satellite_ydotool.py` | `ydotool` (native Wayland uinput) | Requires a running `ydotoold` daemon with adequate uinput permissions. |

## Install & run

```bash
pip install fastapi uvicorn pydantic pyautogui   # pyautogui variant
uvicorn satellite_pyautogui:app --host 0.0.0.0 --port 8001

# or the ydotool variant (no pyautogui needed)
pip install fastapi uvicorn pydantic
uvicorn satellite_ydotool:app --host 0.0.0.0 --port 8001
```

`grim` (screenshot utility) must be installed on the host for the `screenshot` action.

## Security

This service executes local input events and captures the screen. Bind it to localhost or
place it behind authentication before exposing it on any network.
