import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

const HighScorePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadHighscores() {
      try {
        setLoading(true);
        setLoadError(false);
        const data = await apiGet("/highscore");
        setRows(data);
      } catch (e) {
        console.error("Failed to load highscores", e);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    loadHighscores();
  }, []);

  const renderDifficulty = (difficulty) => {
    if (difficulty === "EASY") return "Easy (6×6)";
    if (difficulty === "NORMAL") return "Hard (9×9)";
    return difficulty;
  };

  const showEmptyState =
    !loading && (loadError || !rows || rows.length === 0);

  return (
    <div className="high-score-page">
      <div className="container">
        <div className="highscores-content">
          <h1 className="page-title">High Scores</h1>

          {loading && <p>Loading high scores...</p>}

          {showEmptyState && (
            <div className="empty-state-card">
              <div className="empty-state-row">
                <div className="empty-state-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 4h10v3a5 5 0 0 1-10 0V4Z"
                      stroke="#ffd54f"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 20h6M10 16h4"
                      stroke="#ffd54f"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"
                      stroke="#ffb300"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h2 className="empty-state-title">No completed games yet</h2>
              </div>

              <p className="empty-state-text">
                There are currently no completed games on the leaderboard.
                Play a Sudoku game and finish it to see it here!
              </p>
            </div>
          )}

          {!loading && !showEmptyState && (
            <table className="score-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Game</th>
                  <th>Difficulty</th>
                  <th>Completed By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.gameId}>
                    <td className="rank-cell">
                      {index + 1}
                      {index === 0 && (
                        <span className="medal">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="#FFD700"
                              stroke="#DAA520"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 6 L14 10 L18 10 L15 13 L16 17 L12 14 L8 17 L9 13 L6 10 L10 10 Z"
                              fill="#DAA520"
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td>{row.name}</td>
                    <td>{renderDifficulty(row.difficulty)}</td>
                    <td className="score-cell">{row.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighScorePage;
