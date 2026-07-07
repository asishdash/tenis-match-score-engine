# TENIS MATCH Score (Full Stack)

This app is implemented with:

- React UI (Vite)
- Python FastAPI backend

## 1. Mandatory System Requirement

Mandatory software:

- Python 3.10+
- Node.js 18+
- npm 9+

You can verify locally with:

```bash
python3 --version
node --version
npm --version
```

## Project Structure

- `backend/app/main.py`: API and scoring logic
- `backend/requirements.txt`: Python dependencies
- `frontend/src/App.jsx`: UI and API integration
- `frontend/src/styles.css`: UI styles
- `start.command`: starts backend and frontend together (Mac/Linux)
- `start.ps1`: starts backend and frontend together (Windows PowerShell)
- `start.bat`: Windows wrapper to run `start.ps1`

## API Contract

### `POST /api/match`

Request:

```json
{
   "points": ["A", "A", "B", "A", "B", "B", "A", "A"]
}
```

Response:

```json
{
   "winner": "A",
   "final_score": { "A": 5, "B": 3 },
   "deuce_reached": true,
   "points_processed": 8
}
```

## 2. Start App

Use one command from project root:

```bash (Mac tested)
./start.command
```

Windows (PowerShell-Not tested):

```powershell
.\start.ps1
```

Windows (Command Prompt) - Not Tested:

```bat
start.bat
```

The script will:

1. Check if  required ports are occupied.
2. Ask for confirmation before freeing API/UI ports when needed.
3. Create Python virtual environment if missing.
4. Install backend dependencies from `backend/requirements.txt`.
5. Install frontend dependencies with `npm install`.
6. Start API and UI.

Ports:

- API (FastAPI): `http://127.0.0.1:8000`
- UI (Vite/React): `http://127.0.0.1:5173`

## 3. How To Use App

1. Start the app on Mac/Linux with `./start.command`, on Windows PowerShell with `.\start.ps1`, or on Windows CMD with `start.bat`.
2. If ports `8000` or `5173` are already in use, confirm port cleanup when prompted.
3. Open `http://127.0.0.1:5173` in your browser.
4. In **Current Match**, pick the point winner (`A` or `B`).
5. Click **Submit Winner** for each point.
6. Continue until match winner is reached by rules.
7. View score/winner and summary table.
8. Use **Clear All** to reset score and summary.

## 4. Logic

- Input is a sequence of point winners (`A` or `B`) using the radio selection and submit action.
- If both scores reach 3 and are equal, it is **Deuce** and score is reset/kept at **3-3**.
- Win conditions:
   - `score == 4` and opponent score is `0`, `1`, or `2`
   - `score == 5` and opponent score is `3` (deuce win)

## Manual Run (Optional)

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
```
