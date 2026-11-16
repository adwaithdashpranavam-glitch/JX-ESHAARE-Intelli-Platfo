import subprocess
import base64
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

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
                img_base64 = base64.b64encode(f.read()).decode("utf-8")
            os.remove(temp_file)
            return {"status": "success", "screenshot_length": len(img_base64)}
            
        elif cmd.action == "click":
            x = cmd.coordinates.get("x", 0) if cmd.coordinates else 0
            y = cmd.coordinates.get("y", 0) if cmd.coordinates else 0
            subprocess.run(["ydotool", "mouse", "move", str(x), str(y)])
            subprocess.run(["ydotool", "click", "0"])
            return {"status": "success", "action": "clicked"}
            
        elif cmd.action == "type":
            subprocess.run(["ydotool", "type", cmd.target])
            return {"status": "success", "action": "typed"}
            
        else:
            raise HTTPException(status_code=400, detail="Unknown action")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting Wayland Satellite on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)