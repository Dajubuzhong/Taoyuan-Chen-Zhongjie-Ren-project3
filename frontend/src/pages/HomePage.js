import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    highestScore: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiGet("/stats");
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }

    loadStats();
  }, []);

  const [loadingDifficulty, setLoadingDifficulty] = useState(null);

  async function quickStart(difficulty) {
    if (!user) {
      navigate("/games");
      return;
    }

    try {
      setLoadingDifficulty(difficulty);
      const data = await apiPost("/sudoku", {
        difficulty,
        createdBy: user?.username,
        createdByEmail: user?.email,
      });
      navigate(`/game/${data.gameId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create game. Please check if the backend server is running.");
    } finally {
      setLoadingDifficulty(null);
    }
  }

  return (
    <>
      <div className="main-container">
        <div className="content-wrapper">
          <section className="hero-section">
            <h1 className="hero-title">SUDOKU</h1>
            <p className="hero-subtitle">Challenge Your Mind, Master the Grid</p>

            <div className="quick-start">
              <button
                type="button"
                className="game-link"
                onClick={() => quickStart("EASY")}
                disabled={!user || loadingDifficulty !== null}
              >
                <img
                  src="/images/easy-game-icon.svg"
                  alt="Easy Mode 6x6 Sudoku Icon"
                  className="game-icon"
                />
                <div className="game-link-grid">6×6</div>
                <h3 className="game-link-title">Easy Mode</h3>
                <p className="game-link-desc">
                  {loadingDifficulty === "EASY"
                    ? "Creating game..."
                    : "Perfect for beginners"}
                </p>
              </button>

              <button
                type="button"
                className="game-link"
                onClick={() => quickStart("NORMAL")}
                disabled={!user || loadingDifficulty !== null}
              >
                <img
                  src="/images/hard-game-icon.svg"
                  alt="Hard Mode 9x9 Sudoku Icon"
                  className="game-icon"
                />
                <div className="game-link-grid">9×9</div>
                <h3 className="game-link-title">Hard Mode</h3>
                <p className="game-link-desc">
                  {loadingDifficulty === "NORMAL"
                    ? "Creating game..."
                    : "Ultimate challenge"}
                </p>
              </button>
            </div>

            <div className="stats-section">
              <div className="stat-box">
                <div className="stat-number">
                  {stats.users.toLocaleString()}
                </div>
                <div className="stat-label">Registered Players</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">
                  {stats.highestScore.toLocaleString()}
                </div>
                <div className="stat-label">Highest Game Score</div>
              </div>
            </div>
          </section>

          <section className="features-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Multiple Difficulty Levels</h3>
                <p>
                  Choose from easy 6×6 grids for quick games or challenging 9×9
                  puzzles for the ultimate brain workout
                </p>
              </div>

              <div className="feature-card">
                <h3>Track Your Time</h3>
                <p>
                  Every game is timed so you can track your progress, beat your
                  personal best, and improve your skills
                </p>
              </div>

              <div className="feature-card">
                <h3>High Scores Leaderboard</h3>
                <p>
                  Compete with players worldwide and see how you rank among the
                  best Sudoku solvers
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default HomePage;