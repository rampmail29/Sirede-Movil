// hooks/useGoogleLogin.js
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra; // fallback si se corriera en classic
  const googleOAuth = extra?.googleOAuth ?? {};
  const hasNativeIds = !!(googleOAuth.androidClientId && googleOAuth.iosClientId);

  // En dev o mientras falte android/ios client id, se usará proxy.
  const useProxy = !hasNativeIds;

  const redirectUri = makeRedirectUri({
    scheme: 'siredeapp',
    useProxy,                 // proxy en dev o si faltan client IDs nativos
    preferLocalhost: true,    // mejora DX en web/dev
  });

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId: googleOAuth.webClientId,
      iosClientId: googleOAuth.iosClientId ?? undefined,
      androidClientId: googleOAuth.androidClientId ?? undefined,
      // redirectUri es opcional; Google provider maneja defaults, pero lo dejamos explícito:
      redirectUri,
    },
    { useProxy }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return { request, promptAsync };
}
