import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/api";
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() =>
    sessionStorage.getItem(ADMIN_TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem(ADMIN_USER_KEY);
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      sessionStorage.removeItem(ADMIN_USER_KEY);
      return null;
    }
  });

  const inactivityTimerRef = useRef(null);
  const hasLoggedOutRef = useRef(false);

  const updateToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem(ADMIN_USER_KEY);
    }
  }, []);

  const handleLogout = useCallback(
    async (options = { showToast: true, message: null }) => {
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;

      try {
        const currentToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
        if (currentToken) {
          await fetch(`${API_BASE_URL}/admin/logout`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          });
        }
      } catch (error) {
        console.error("Error during API logout call:", error);
      } finally {
        updateToken(null);
        updateUser(null);
        if (options.showToast) {
          toast.success(options.message || "Anda berhasil keluar.");
        }
        navigate("/login");
        setTimeout(() => {
          hasLoggedOutRef.current = false;
        }, 500);
      }
    },
    [navigate, updateToken, updateUser]
  );

  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = token;
      const defaultHeaders = {
        Accept: "application/json",
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      };

      if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

        if (response.status === 401 && !hasLoggedOutRef.current) {
          handleLogout({
            showToast: true,
            message: "Sesi Anda telah berakhir. Silakan login kembali.",
          });
          throw new Error("Unauthorized");
        }
        return response;
      } catch (error) {
        if (error.message !== "Unauthorized") {
          console.error("Fetch error:", error);
          toast.error("Terjadi kesalahan koneksi. Silakan coba lagi.");
        }
        throw error;
      }
    },
    [token, handleLogout]
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (!hasLoggedOutRef.current) {
        handleLogout({
          showToast: true,
          message: "Sesi Anda berakhir karena tidak ada aktivitas.",
        });
      }
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    if (token) {
      const activityEvents = [
        "click",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
      ];
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, resetInactivityTimer, {
          passive: true,
        });
      });
      resetInactivityTimer();

      return () => {
        activityEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [token, resetInactivityTimer]);

  const value = useMemo(
    () => ({
      token,
      user,
      setToken: updateToken,
      setUser: updateUser,
      handleLogout,
      authFetch,
    }),
    [token, user, updateToken, updateUser, handleLogout, authFetch]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;
