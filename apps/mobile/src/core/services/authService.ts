import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export const AuthService = {
  mapAuthError(error: any) {
    const code = error.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email address or password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'The password provided is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection.';
      default:
        return error.message || 'An unknown error occurred. Please try again.';
    }
  },

  async registerWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: this.mapAuthError(error) };
    }
  },
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: this.mapAuthError(error) };
    }
  },
  async logout() {
    try {
      await signOut(auth);
      try {
        await GoogleSignin.signOut();
      } catch (e) {
      }
      return { error: null };
    } catch (error: any) {
      return { error: this.mapAuthError(error) };
    }
  },
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }
      const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },
};