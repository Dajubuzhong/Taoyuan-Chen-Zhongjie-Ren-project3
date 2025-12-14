// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiPost } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse auth_user", e);
        window.localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const payload = { email: String(email || "").trim(), password: String(password || "") };
    const data = await apiPost("/login", payload);
    setUser(data);
    window.localStorage.setItem("auth_user", JSON.stringify(data));
    return data;
  };

  const register = async (email, username, password) => {
    const payload = {
      email: String(email || "").trim(),
      username: String(username || "").trim(),
      password: String(password || ""),
    };
    const data = await apiPost("/register", payload);
    setUser(data);
    window.localStorage.setItem("auth_user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem("auth_user");
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
