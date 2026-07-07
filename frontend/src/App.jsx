import React, { useState } from "react";

const INITIAL_HISTORY = [];

function tennisPointLabel(score) {
  if (score <= 0) return "0";
  if (score === 1) return "15";
  if (score === 2) return "30";
  if (score >= 3) return "40";
  return "0";
}

function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function App() {
  const [selectedWinner, setSelectedWinner] = useState("A");
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [actualA, setActualA] = useState(0);
  const [actualB, setActualB] = useState(0);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [deuceReached, setDeuceReached] = useState(false);

  const overallWinner = currentWinner;

  function isWinningScore(playerScore, opponentScore) {
    const normalWin = playerScore === 4 && [0, 1, 2].includes(opponentScore);
    const deuceWin = playerScore === 5 && opponentScore === 3;
    return normalWin || deuceWin;
  }

  function submitWinner() {
    if (currentWinner) {
      return;
    }

    let nextA = scoreA;
    let nextB = scoreB;
    let nextActualA = actualA;
    let nextActualB = actualB;

    if (selectedWinner === "A") {
      nextA += 1;
      nextActualA += 1;
    } else {
      nextB += 1;
      nextActualB += 1;
    }

    let deuceNow = deuceReached;

    // Deuce rule: when both scores tie at/after 3, keep the score at 3-3.
    if (nextA >= 3 && nextB >= 3 && nextA === nextB) {
      nextA = 3;
      nextB = 3;
      deuceNow = true;
    }

    setScoreA(nextA);
    setScoreB(nextB);
    setActualA(nextActualA);
    setActualB(nextActualB);
    setDeuceReached(deuceNow);

    let winner = null;
    if (isWinningScore(nextA, nextB)) winner = "A";
    if (isWinningScore(nextB, nextA)) winner = "B";

    if (!winner) {
      return;
    }

    setCurrentWinner(winner);

    const nextId = history.length + 1;
    const pointView = deuceNow
      ? "Deuce"
      : `${tennisPointLabel(nextA)} - ${tennisPointLabel(nextB)}`;

    const nextEntry = {
      id: nextId,
      winner,
      result: `${nextA} - ${nextB}`,
      scoreA: nextActualA,
      scoreB: nextActualB,
      points: pointView,
      dateTime: nowLabel(),
    };

    // Keep all completed match results in summary.
    setHistory((prev) => [...prev, nextEntry]);
  }

  function clearAll() {
    setHistory([]);
    setSelectedWinner("A");
    setScoreA(0);
    setScoreB(0);
    setActualA(0);
    setActualB(0);
    setCurrentWinner(null);
    setDeuceReached(false);
  }

  return (
    <main className="shell">
      <section className="hero card">
        <div className="hero-brand">
          <div className="logo">🎾</div>
          <div>
            <h1>TENNIS MATCH SCORE ENGINE</h1>
            <p className="subtext">Match A vs B</p>
          </div>
        </div>

        <div className="overall">
          <p className="overall-title">SCORE</p>
          <div className="overall-values">
            <div>
              <p className="player-a">A</p>
              <strong>{scoreA}</strong>
              <span>POINTS</span>
            </div>
            <div className="divider" />
            <div>
              <p className="player-b">B</p>
              <strong>{scoreB}</strong>
              <span>POINTS</span>
            </div>
          </div>
          <p className="overall-winner">
            Winner: {overallWinner ? `Player ${overallWinner}` : "-"}
          </p>
        </div>
      </section>

      <section>
        <article className="card">
          <div className="section-title">
            <span className="badge">2</span>
            <h2>CURRENT MATCH</h2>
          </div>

          <div className={`winner-banner ${currentWinner ? "ok" : "neutral"}`}>
            {currentWinner ? (
              <>
                <strong>Winner Found!</strong>
                <span>Player {currentWinner} is the winner of this match.</span>
              </>
            ) : (
              <>
                <strong>Match in progress</strong>
                <span>
                  If both scores reach 3, it is Deuce (3-3). Win at 4-0/1/2 or 5-3.
                </span>
              </>
            )}
          </div>

          <fieldset className="winner-pick">
            <legend>Select Winner</legend>
            <label>
              <input
                type="radio"
                name="winner"
                value="A"
                checked={selectedWinner === "A"}
                onChange={(e) => setSelectedWinner(e.target.value)}
              />
              A - Player A
            </label>
            <label>
              <input
                type="radio"
                name="winner"
                value="B"
                checked={selectedWinner === "B"}
                onChange={(e) => setSelectedWinner(e.target.value)}
              />
              B - Player B
            </label>
          </fieldset>

          <button
            type="button"
            className="btn-primary full"
            onClick={submitWinner}
            disabled={Boolean(currentWinner)}
          >
            Submit Winner
          </button>
        </article>
      </section>

      <section className="card">
        <div className="section-title">
          <span className="badge">3</span>
          <h2>MATCH SUMMARY</h2>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Match No.</th>
                <th>Winner</th>
                <th>Result</th>
                <th>Points (A - B)</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">No matches yet</td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <span className={`winner-chip ${row.winner === "A" ? "a" : "b"}`}>
                        {row.winner}
                      </span>{" "}
                      Player {row.winner}
                    </td>
                    <td>{`A ${row.scoreA ?? row.result.split(" - ")[0]} - B ${row.scoreB ?? row.result.split(" - ")[1]}`}</td>
                    <td>{row.points}</td>
                    <td>{row.dateTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="footer-actions">
        <button type="button" className="btn-ghost" onClick={clearAll}>
          Clear All
        </button>
        <p>Ready for next match!</p>
      </section>
    </main>
  );
}
