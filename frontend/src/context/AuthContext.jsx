import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken, getAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, try a silent refresh using the httpOnly cookie
  // so the user stays logged in across page reloads.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        const meRes = await api.get("/auth/me");
        setUser(meRes.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, isAuthenticated: !!getAccessToken() }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
