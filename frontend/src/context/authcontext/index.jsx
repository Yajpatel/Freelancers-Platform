import React, { useContext, useState, useEffect,useCallback  } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Add state for unread count


  // Function to fetch or refresh the unread count
  const fetchUnreadCount = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const res = await axios.get(`http://localhost:8000/messages/getunreadcount/${uid}`);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0); // Reset on error
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      const isGoogle = user.providerData.some(
        (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      );
      
      setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);

      // // 🔁 SYNC to MongoDB backend
      // try {
      //   await fetch("http://localhost:8000/api/users/saveUser", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       email: user.email,
      //       name: user.displayName || "", // optional
      //     }),
      //   });
      // } catch (error) {
      //   console.error("Failed to sync user:", error);
      // }

    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }

    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser,
    unreadCount, // Expose count
    refreshUnreadCount: () => fetchUnreadCount(currentUser?.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
