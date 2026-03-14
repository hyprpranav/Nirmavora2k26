import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [emailVerified, setEmailVerified] = useState(false);

  /* Handle redirect result on page load (for signInWithRedirect — Google) */
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('[Auth] Redirect sign-in successful:', result.user.email);
          // Google users are always verified
          setEmailVerified(true);
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
        // Google users are always verified; email users need emailVerified
        const isVerified = firebaseUser.emailVerified ||
          firebaseUser.providerData.some((p) => p.providerId === 'google.com');
        setEmailVerified(isVerified);

        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setProfile(data);
            const bypass = data.verificationBypass === true;
            setEmailVerified(isVerified || bypass);
          } else {
            /* First-time user → create profile */
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: ROLES.PARTICIPANT,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('[Auth] Error loading profile:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Google Sign-In — redirect (most reliable across all browsers) */
  async function signInWithGoogle() {
    console.log('[Auth] Starting Google redirect sign-in...');
    await signInWithRedirect(auth, googleProvider);
    // Page will reload after redirect — result handled in useEffect above
    return null;
  }

  /* Email Sign-Up — creates Firebase user + sends verification email */
  async function signUpWithEmail(name, email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // Send Firebase verification email (FREE, built-in)
    await sendEmailVerification(result.user);
    const newProfile = {
      uid: result.user.uid,
      email,
      displayName: name,
      photoURL: null,
      role: ROLES.PARTICIPANT,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', result.user.uid), newProfile);
    setProfile(newProfile);
    return result.user;
  }

  /* Resend verification email */
  async function resendVerificationEmail() {
    if (!auth.currentUser) throw new Error('Not signed in');
    await sendEmailVerification(auth.currentUser);
  }

  /* Refresh verification status (after user clicks link in email) */
  async function refreshEmailVerified() {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    setEmailVerified(verified);
    return verified;
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

  /* Update profile role (admin use) */
  async function updateRole(uid, newRole) {
    await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
    if (uid === user?.uid) setProfile((p) => ({ ...p, role: newRole }));
  }

  /* Sign up as organiser (no email verification — request goes to admin) */
  async function signUpAsOrganiser(name, email, password, reason) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    const newProfile = {
      uid: result.user.uid,
      email,
      displayName: name,
      photoURL: null,
      role: ROLES.PARTICIPANT,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', result.user.uid), newProfile);
    await setDoc(doc(db, 'organiserRequests', result.user.uid), {
      uid: result.user.uid,
      email,
      displayName: name,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setProfile(newProfile);
    return result.user;
  }

  /* Request organiser role (for already-signed-in users) */
  async function requestOrganiserRole(reason) {
    if (!user) throw new Error('Not signed in');
    await setDoc(doc(db, 'organiserRequests', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || profile?.displayName,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  /* Get pending organiser requests (admin only) */
  async function getOrganiserRequests() {
    const q = query(collection(db, 'organiserRequests'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  /* Approve or reject organiser request */
  async function handleOrganiserRequest(requestId, uid, approve) {
    if (approve) {
      await updateRole(uid, ROLES.ORGANISER);
    }
    await setDoc(doc(db, 'organiserRequests', requestId), {
      status: approve ? 'approved' : 'rejected',
      decidedAt: new Date().toISOString(),
    }, { merge: true });
  }

  const value = {
    user,
    profile,
    loading,
    emailVerified,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signUpAsOrganiser,
    signOut,
    resendVerificationEmail,
    refreshEmailVerified,
    updateRole,
    requestOrganiserRole,
    getOrganiserRequests,
    handleOrganiserRequest,
    isAdmin: profile?.role === ROLES.ADMIN,
    isOrganiser: profile?.role === ROLES.ORGANISER || profile?.role === ROLES.ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
