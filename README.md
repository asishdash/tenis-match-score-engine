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
- `start.command`: starts backend and frontend together

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

```bash
./start.command
```

The script will:

1. Check if required ports are occupied.
2. Force free API/UI ports when needed.
3. Create Python virtual environment if missing.
4. Install backend dependencies from `backend/requirements.txt`.
5. Install frontend dependencies with `npm install`.
6. Start API and UI.

Ports:

- API (FastAPI): `http://127.0.0.1:8000`
- UI (Vite/React): `http://127.0.0.1:5173`

## 3. How To Use App

1. Before running, confirm whether you want to free occupied ports (`8000` and `5173`), then run `./start.command`.
2. Open `http://127.0.0.1:5173` in your browser.
3. In **Current Match**, pick the point winner (`A` or `B`).
4. Click **Submit Winner** for each point.
5. Continue until match winner is reached by rules.
6. View score/winner and summary table.
7. Use **Clear All** to reset score and summary.

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
