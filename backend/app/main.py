from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    points: list[str] = Field(default_factory=list)


class MatchResult(BaseModel):
    winner: str
    final_score: dict[str, int]
    deuce_reached: bool
    points_processed: int


app = FastAPI(title="Tenis Match API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/match", response_model=MatchResult)
def calculate_match_winner(payload: MatchRequest) -> MatchResult:
    try:
        result = determine_winner(payload.points)
        return MatchResult(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def determine_winner(point_sequence: list[str]) -> dict[str, object]:
    validate_input(point_sequence)

    score_a = 0
    score_b = 0
    deuce_reached = False

    for idx, point_winner in enumerate(point_sequence, start=1):
        if point_winner == "A":
            score_a += 1
        else:
            score_b += 1

        # Per requirement: whenever both players are tied at/after 3, reset to 3-3.
        if score_a >= 3 and score_b >= 3 and score_a == score_b:
            score_a = 3
            score_b = 3
            deuce_reached = True

        if is_match_won(score_a, score_b):
            return {
                "winner": "A",
                "final_score": {"A": score_a, "B": score_b},
                "deuce_reached": deuce_reached,
                "points_processed": idx,
            }

        if is_match_won(score_b, score_a):
            return {
                "winner": "B",
                "final_score": {"A": score_a, "B": score_b},
                "deuce_reached": deuce_reached,
                "points_processed": idx,
            }

    raise ValueError("Input ended before a valid match winner was determined.")


def validate_input(point_sequence: list[str]) -> None:
    if not isinstance(point_sequence, list):
        raise ValueError("Input must be an array.")

    for value in point_sequence:
        if value not in ("A", "B"):
            raise ValueError('Input array may only contain "A" and "B".')


def is_match_won(score: int, opponent_score: int) -> bool:
    normal_win = score == 4 and opponent_score in (0, 1, 2)
    deuce_win = score == 5 and opponent_score == 3
    return normal_win or deuce_win
