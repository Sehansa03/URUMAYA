
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authAPI } from "../api/auth";
import {
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
  waitForPendingRefresh,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session when the app loads
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        await refreshAccessToken();

        const response = await authAPI.getProfile();

        if (active) {
          setUser(response.data.data.user);
        }
      } catch {
        if (active) {
          clearAccessToken();
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
  await waitForPendingRefresh();

  const response = await authAPI.login(credentials);

  setAccessToken(response.data.data.accessToken);
  setUser(response.data.data.user);

  return response.data;
};

  const register = async (details) => {
    const response = await authAPI.register(details);
    return response.data;
  };

const logout = async () => {
  try {
    await waitForPendingRefresh();
    await authAPI.logout();
  } finally {
    clearAccessToken();
    setUser(null);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
