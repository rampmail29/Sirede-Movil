// services/userProfileService.js
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getInitialSetupCompleted(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return false;
    return !!snap.data().initialSetupCompleted;
  } catch (e) {
    //console.log("[Firestore] getInitialSetupCompleted error:", e);
    // Si es permisos, lánzalo con un code reconocible
    e.code = e.code || "firestore/permission-denied";
    throw e;
  }
}

export async function ensureEmailInProfile() {
  const u = auth.currentUser;
  if (!u) return;
  await getDoc(doc(db, "users", u.uid), { email: u.email }, { merge: true });
}
