from typing import List
from collections import defaultdict

from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates


# Хранилище сообщений (в памяти)
qr_counter = defaultdict(int)

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/assets", StaticFiles(directory="app/assets"), name="assets")

@app.get("/scanner", response_class=HTMLResponse)
def read_item(request: Request):
    return templates.TemplateResponse("scanner.html", {"request": request})

@app.get("/view", response_class=HTMLResponse)
def read_item(request: Request):
    return templates.TemplateResponse("view.html", {"request": request})

@app.post("/send")
async def send_message(message: str = Form(...)):
    msg = message.strip()

    if msg:
        qr_counter[msg] += 1

    return JSONResponse(content={"success": True})

@app.get("/messages")
async def get_messages():
    return JSONResponse(content={"counts": dict(qr_counter)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)