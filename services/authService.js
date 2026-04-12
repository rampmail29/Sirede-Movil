// services/authService.js
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  signOut,
} from 'firebase/auth';

export const signInEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const sendReset = (email) =>
  sendPasswordResetEmail(auth, email.trim().toLowerCase());

export const getSignInMethods = (email) =>
  fetchSignInMethodsForEmail(auth, email.trim().toLowerCase());

export const logOut = () => signOut(auth);
