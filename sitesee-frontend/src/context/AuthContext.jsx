// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load User on App Start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await fetch("https://sitesee-api.onrender.com/api/auth/user", {
            headers: { "x-auth-token": token },
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data);
          } else {
            console.error("Auth Load Failed:", data);
            logout();
          }
        } catch (err) {
          console.error("Auth Load Error:", err);
          logout();
        }
      }
    };
    loadUser();
  }, [token]);

  // Login Function
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};