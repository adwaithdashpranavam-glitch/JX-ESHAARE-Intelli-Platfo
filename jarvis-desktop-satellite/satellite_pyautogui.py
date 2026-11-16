#!/usr/bin/env python3
import subprocess
import base64
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import pyautogui

app = FastAPI(title="JARVIS Desktop Satellite - Wayland Edition")

# Safety first: moving mouse to top-left corner aborts all actions
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.5

class DesktopCommand(BaseModel):
    action: str
    target: str = ""
    coordinates: dict = None

@app.get("/health")
async def health_check():
    return {"status": "online", "device": "office-x8664", "session": "wayland"}

@app.post("/api/v1/desktop/execute")
async def execute_command(cmd: DesktopCommand):
    try:
        if cmd.action == "screenshot":
            temp_file = "/tmp/jarvis_screenshot.png"
            subprocess.run(["grim", temp_file], check=True)
            
            with open(temp_file, "rb") as f:
                img_bytes = f.read()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            os.remove(temp_file)
            
            return {"status": "success", "screenshot_length": len(img_base64)}
        
        elif cmd.action == "click":
            x = cmd.coordinates.get("x", 0) if cmd.coordinates else 0
            y = cmd.coordinates.get("y", 0) if cmd.coordinates else 0
            pyautogui.click(x, y)
            return {"status": "success", "action": "clicked", "coordinates": {"x": x, "y": y}}
        
        elif cmd.action == "type":
            pyautogui.write(cmd.target, interval=0.05)
            return {"status": "success", "action": "typed"}
            
        elif cmd.action == "move":
            x = cmd.coordinates.get("x", 0) if cmd.coordinates else 0
            y = cmd.coordinates.get("y", 0) if cmd.coordinates else 0
            pyautogui.moveTo(x, y, duration=0.5)
            return {"status": "success", "action": "moved"}
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {cmd.action}")
            
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Screenshot failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 JARVIS Desktop Satellite (Wayland) starting on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)