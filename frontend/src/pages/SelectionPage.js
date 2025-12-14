import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import { useAuth } from "../context/AuthContext";

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SelectionPage = () => {
  const [games, setGames] = useState([]);
  const { user } = useAuth();
  const readOnly = !user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGames() {
      try {
        setError("");
        setLoading(true);
        const data = await apiGet("/sudoku");
        setGames(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load games list. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  async function createGame(difficulty) {
    if (readOnly) return;
    try {
      const data = await apiPost("/sudoku", {
        difficulty,
        createdBy: user?.username,
        createdByEmail: user?.email,
      });

      navigate(`/game/${data.gameId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create game. Please make sure the backend is running.");
    }
  }

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="selection">
          <h1 className="page-title">Select a Game</h1>

          <div className="game-controls">
            <button
              className="control-button"
              onClick={() => createGame("NORMAL")}
              disabled={readOnly}
              style={readOnly ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
            >
              Create Normal Game
            </button>
            <button
              className="control-button"
              onClick={() => createGame("EASY")}
              disabled={readOnly}
              style={readOnly ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
            >
              Create Easy Game
            </button>
          </div>

          {readOnly && (
            <p style={{ marginTop: "0.75rem", color: "#888", textAlign: "center" }}>
              You can browse games, but you must log in to create and play.
            </p>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          {loading ? (
            <h2 className="status-text loading">Loading...</h2>
          ) : games.length === 0 ? (
            <h2 className="status-text empty">
              No games yet. {readOnly ? "Log in to create one." : "Click above to start a game!"}
            </h2>
          ) : (
            <div className="games-list">
              {games.map((g) => (
                <div
                  key={g.id}
                  className="game-link"
                  onClick={() => navigate(`/game/${g.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="game-item">
                    <div className="game-info">
                      <div className="game-title">{g.name}</div>
                      <div className="game-author">by {g.createdBy}</div>
                    </div>
                    <span
                      className={
                        "game-difficulty " +
                        (g.difficulty === "NORMAL" ? "difficulty-hard" : "difficulty-easy")
                      }
                    >
                      {g.difficulty === "NORMAL" ? "Hard (9x9)" : "Easy (6x6)"} –{" "}
                      {formatDate(g.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;
