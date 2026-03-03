import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { ROLES } from '../config/constants';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpVerified, setOtpVerified] = useState(false);

  /* Handle redirect result on page load (for signInWithRedirect) */
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('[Auth] Redirect sign-in successful:', result.user.email);
          await setDoc(doc(db, 'users', result.user.uid), { otpVerified: true }, { merge: true });
          setOtpVerified(true);
        }
      })
      .catch((err) => {
        console.error('[Auth] Redirect result error:', err.code, err.message);
      });
  }, []);

  /* Listen to Firebase auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data());
            setOtpVerified(profileDoc.data().otpVerified || false);
          } else {
            /* First-time user → create profile */
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: ROLES.PARTICIPANT,
              otpVerified: false,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
            setOtpVerified(false);
          }
        } catch (err) {
          console.error('[Auth] Error loading profile:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setOtpVerified(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Google Sign-In – try popup first, fall back to redirect */
  async function signInWithGoogle() {
    try {
      console.log('[Auth] Attempting Google popup sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      console.log('[Auth] Popup sign-in success:', firebaseUser.email);
      await setDoc(doc(db, 'users', firebaseUser.uid), { otpVerified: true }, { merge: true });
      setOtpVerified(true);
      return firebaseUser;
    } catch (err) {
      console.warn('[Auth] Popup failed:', err.code, err.message);
      // If popup was blocked or failed, try redirect
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/internal-error'
      ) {
        console.log('[Auth] Falling back to redirect sign-in...');
        await signInWithRedirect(auth, googleProvider);
        // Page will reload after redirect — result handled in useEffect above
        return null;
      }
      throw err; // Re-throw for other errors (unauthorized domain etc.)
    }
  }

  /* Email Sign-Up – creates Firebase user + Firestore profile */
  async function signUpWithEmail(name, email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    const newProfile = {
      uid: result.user.uid,
      email,
      displayName: name,
      photoURL: null,
      role: ROLES.PARTICIPANT,
      otpVerified: true, // OTP was verified before calling this
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', result.user.uid), newProfile);
    setProfile(newProfile);
    setOtpVerified(true);
    return result.user;
  }

  /* Email Sign-In */
  async function signInWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  /* Sign out */
  async function signOut() {
    await firebaseSignOut(auth);
  }

  /* Mark OTP as verified in Firestore */
  async function markOtpVerified() {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { otpVerified: true }, { merge: true });
    setProfile((p) => ({ ...p, otpVerified: true }));
    setOtpVerified(true);
  }

  /* Update profile role (admin use) */
  async function updateRole(uid, newRole) {
    await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
    if (uid === user?.uid) setProfile((p) => ({ ...p, role: newRole }));
  }

  const value = {
    user,
    profile,
    loading,
    otpVerified,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    markOtpVerified,
    updateRole,
    isAdmin: profile?.role === ROLES.ADMIN,
    isOrganiser: profile?.role === ROLES.ORGANISER || profile?.role === ROLES.ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
