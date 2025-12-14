import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Timer from "../components/Timer";
import SudokuBoard from "../components/SudokuBoard";
import { useSudokuState, useSudokuDispatch, ACTIONS } from "../context/SudokuContext";
import { apiGet, apiPost } from "../api";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [error, setError] = useState("");

  const { status, currentGameId } = useSudokuState();
  const dispatch = useSudokuDispatch();

  const [reported, setReported] = useState(false);

  const userKey = useMemo(() => {
    const k = user?.email ? String(user.email).trim().toLowerCase() : "";
    return k ? k : "anonymous";
  }, [user]);

  const readOnly = userKey === "anonymous";

  const expectedCompositeKey = useMemo(() => {
    return `${userKey}::${String(gameId)}`;
  }, [userKey, gameId]);

  const prevStatusRef = useRef(null);

  useEffect(() => {
    async function loadGame() {
      try {
        setError("");
        const data = await apiGet(`/sudoku/${gameId}`);
        setGame(data);
        setReported(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load game. Please try again later.");
      }
    }
    loadGame();
  }, [gameId]);

  useEffect(() => {
    if (!game) return;

    const desiredMode = game.difficulty === "EASY" ? "easy" : "normal";
    let cancelled = false;

    async function initForUserAndGame() {
      try {
        dispatch({
          type: ACTIONS.START_NEW_GAME,
          payload: { mode: desiredMode, gameId: game.id, userKey },
        });

        setReported(false);

        if (userKey === "anonymous") return;

        const st = await apiGet(
          `/highscore/status/${game.id}?email=${encodeURIComponent(userKey)}`
        );

        if (cancelled) return;

        if (st?.completed) {
          dispatch({ type: ACTIONS.FORCE_COMPLETE });
          setReported(true);
        }
      } catch (e) {
        console.error("Failed to init/sync completion state", e);
        dispatch({
          type: ACTIONS.START_NEW_GAME,
          payload: { mode: desiredMode, gameId: game.id, userKey },
        });
        setReported(false);
      }
    }

    initForUserAndGame();
    return () => {
      cancelled = true;
    };
  }, [game, userKey, dispatch]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (!game) return;
    if (userKey === "anonymous") return;
    if (reported) return;

    if (currentGameId !== expectedCompositeKey) return;
    if (!(prev === "playing" && status === "completed")) return;

    (async () => {
      try {
        await apiPost("/highscore", {
          gameId: game.id,
          email: userKey,
        });
        setReported(true);
      } catch (e) {
        console.error("Failed to report highscore", e);
      }
    })();
  }, [status, game, userKey, reported, currentGameId, expectedCompositeKey]);

  const handleReset = () => {
    if (readOnly) return;
    dispatch({ type: ACTIONS.RESET_GAME });
    setReported(false);
  };

  const canDelete = useMemo(() => {
    if (!user?.email) return false;
    if (!game?.createdByEmail) return false;
    return (
      String(user.email).trim().toLowerCase() ===
      String(game.createdByEmail).trim().toLowerCase()
    );
  }, [user, game]);


  const handleDelete = async () => {
    if (!user?.email || !game) return;

    const ok = window.confirm("Delete this game? This cannot be undone.");
    if (!ok) return;

    try {
      const url = `/sudoku/${game.id}?email=${encodeURIComponent(
        String(user.email).trim().toLowerCase()
      )}`;

      const resp = await fetch(`http://localhost:4000/api${url}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Delete failed");
      }

      navigate("/games");
    } catch (e) {
      console.error(e);
      alert("Failed to delete game.");
    }
  };

  if (error) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const isEasy = game.difficulty === "EASY";
  const title = isEasy ? "Easy Game (6×6)" : "Hard Game (9×9)";
  const containerClass = isEasy ? "easy-game-page" : "normal-game-page";

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className={containerClass}>
          <div className="game-container">
            <div className="game-header">
              <h1>{title}</h1>
              <Timer />
            </div>

            <SudokuBoard />

            <div className="game-controls">
              <button className="control-button" onClick={handleReset}
                disabled={readOnly}
                style={ readOnly ? { opacity: 0.55, cursor: "not-allowed" } : undefined }
              >
                Reset
              </button>

              {canDelete && (
                <button className="control-button" onClick={handleDelete}
                  style={{
                    background: "linear-gradient(135deg, #ff4d4f 0%, #c41d7f 100%)",
                    boxShadow: "0 4px 15px rgba(255, 77, 79, 0.35)",
                  }}
                >
                  DELETE
                </button>
              )}
            </div>

            <p style={{marginTop: "0.5rem", color: "gray", display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "1rem"}}>
              <span>Game ID: {game.id}</span>
              <span>Created By: {game.createdBy}</span>
              <span>You: {user ? user.username : "Guest"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
