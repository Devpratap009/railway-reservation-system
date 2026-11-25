import { useEffect, useState } from "react";
import { authAPI } from "../api/axios";

import { AuthContext } from "./authContext";

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("railpulse_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("railpulse_token")));

  useEffect(() => {
    const savedToken = localStorage.getItem("railpulse_token");
    if (!savedToken) return undefined;

    let active = true;
    authAPI.me()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem("railpulse_user", JSON.stringify(data.user));
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("railpulse_token");
        localStorage.removeItem("railpulse_user");
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password, role) => {
    const { data } = await authAPI.login({ email, password, role });
    localStorage.setItem("railpulse_token", data.token);
    localStorage.setItem("railpulse_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("railpulse_token");
    localStorage.removeItem("railpulse_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

