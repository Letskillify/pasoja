import React, { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "./useAuth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setLoading(false);
      if (u) {
        const userDoc = doc(db, "users", u.uid);
        const snap = await getDoc(userDoc);
        if (!snap.exists()) {
          await setDoc(userDoc, {
            email: u.email || "",
            displayName: u.displayName || "",
            createdAt: serverTimestamp(),
          });
        }
      }
    });
    return () => unsub();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const userDoc = doc(db, "users", cred.user.uid);
    await setDoc(userDoc, {
      email: cred.user.email || "",
      displayName: displayName || "",
      createdAt: serverTimestamp(),
    });
    return cred;
  };
  const logout = () => signOut(auth);

  const value = { user, loading, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
