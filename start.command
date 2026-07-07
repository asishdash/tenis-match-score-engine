#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
API_PORT=8000
UI_PORT=5173

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: '$cmd' is required but not installed." >&2
    exit 1
  fi
}

free_port() {
  local port="$1"
  local answer
  local pids
  pids="$(lsof -ti tcp:"$port" || true)"
  if [ -n "$pids" ]; then
    echo "Port $port is in use by PID(s): $pids"
    read -r -p "Do you want to free port $port now? (y/n): " answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
      echo "Releasing PID(s): $pids"
      kill $pids || true
      sleep 1
      pids="$(lsof -ti tcp:"$port" || true)"
      if [ -n "$pids" ]; then
        echo "Force releasing remaining PID(s): $pids"
        kill -9 $pids || true
      fi
    else
      echo "Port $port remains in use. Please free it manually and rerun ./start.command"
      exit 1
    fi
  else
    echo "Port $port is free."
  fi
}

require_cmd python3
require_cmd node
require_cmd npm
require_cmd lsof

free_port "$API_PORT"
free_port "$UI_PORT"

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "$BACKEND_DIR/.venv"
fi

echo "Installing backend requirements..."
"$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

cleanup() {
  if [ -n "$BACK_PID" ]; then kill "$BACK_PID" 2>/dev/null || true; fi
}

trap cleanup EXIT INT TERM

(
  cd "$BACKEND_DIR"
  "$BACKEND_DIR/.venv/bin/uvicorn" app.main:app --reload --port "$API_PORT"
) &
BACK_PID=$!

cd "$FRONTEND_DIR"
echo "Installing frontend requirements..."
npm install
echo "API: http://127.0.0.1:$API_PORT"
echo "UI:  http://127.0.0.1:$UI_PORT"
npm run dev -- --host 127.0.0.1 --port "$UI_PORT" --strictPort
