import { createContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/token";
import { getCurrentUser } from "../services/authService";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData.user || userData);
        } catch (error) {
          console.error("Failed to fetch user", error);
          removeToken();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (token) => {
    setToken(token);
    try {
      const userData = await getCurrentUser();
      setUser(userData.user || userData);
    } catch (error) {
      console.error("Failed to fetch user after login", error);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}