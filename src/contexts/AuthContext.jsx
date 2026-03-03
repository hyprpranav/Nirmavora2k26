import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
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

  /* Listen to Firebase auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
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
      } else {
        setUser(null);
        setProfile(null);
        setOtpVerified(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Google Sign-In – instant, no OTP needed (Google already verified email) */
  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    // Ensure profile has otpVerified: true for Google users
    await setDoc(doc(db, 'users', firebaseUser.uid), { otpVerified: true }, { merge: true });
    setOtpVerified(true);
    return firebaseUser;
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
