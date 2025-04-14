import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Ambil token dan data user dari sessionStorage (jika ada)
  const [token, setToken] = useState(
    () => sessionStorage.getItem("admin_token") || null
  );
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("admin_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 menit

  // Gunakan useRef untuk menyimpan timer dan flag logout
  const inactivityTimerRef = useRef(null);
  const hasLoggedOutRef = useRef(false);

  // Update token di state dan sessionStorage
  const updateToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      sessionStorage.setItem("admin_token", newToken);
    } else {
      sessionStorage.removeItem("admin_token");
    }
  };

  // Update user di state dan sessionStorage
  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem("admin_user", JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem("admin_user");
    }
  };

  // authFetch untuk request API dengan header Authorization
  const authFetch = useCallback(
    async (url, options = {}) => {
      const defaultHeaders = {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Jika body bukan FormData, set Content-Type ke application/json
      if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      try {
        const response = await fetch(url, mergedOptions);
        if (response.status === 401) {
          // Hanya panggil logout sekali
          if (!hasLoggedOutRef.current) {
            handleLogout();
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          }
        }
        return response;
      } catch (error) {
        console.error("Network error:", error);
        toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
        throw error;
      }
    },
    [token] // Jangan masukkan handleLogout agar tidak terjadi dependency circular
  );

  // Fungsi logout (pastikan hanya dipanggil sekali)
  const handleLogout = useCallback(async () => {
    if (hasLoggedOutRef.current) return; // Cegah logout ganda
    hasLoggedOutRef.current = true;
    try {
      const response = await authFetch("/api/admin/logout", {
        method: "POST",
      });
      if (!response.ok) {
        console.error("Logout API error:", await response.text());
      }
    } catch (error) {
      console.error("Error saat logout:", error);
    } finally {
      updateToken(null);
      updateUser(null);
      navigate("/login");
      toast.success("Anda berhasil keluar");
    }
  }, [navigate, authFetch]);

  // Reset timer inaktivitas
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (!hasLoggedOutRef.current) {
        handleLogout();
        toast.info("Sesi Anda telah berakhir karena tidak ada aktivitas.");
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
        window.addEventListener(eventName, resetInactivityTimer);
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
    }
  }, [token, resetInactivityTimer]);

  const value = {
    token,
    user,
    setToken: updateToken,
    setUser: updateUser,
    navigate,
    handleLogout,
    authFetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
