export default ({ config }) => ({
  expo: {
    ...config,

    name: "SiredeApp",
    slug: "SiredeMovil",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "siredeapp",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sirede.app",
      newArchEnabled: true
    },
    android: {
      package: "com.sirede.app",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      newArchEnabled: true
      // Dejar permisos vacíos a menos que realmente sea neceario forzarlos
      // "permissions": []
    },
    web: {
      favicon: "./assets/icon.png",
      bundler: "metro"
    },
    plugins: [
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true
        }
      ]
    ],

    /**
     *  Aquí centralizamos los OAuth Client IDs
     * - NO son secretos; se pueden guardar en el repo si se requiere
     * - Luego se pueden usar variables de entorno para reemplazar los strings
     *   por process.env.MI_VARIABLE y configurarlas en EAS.
     */
    extra: {
      APP_ENV: process.env.APP_ENV ?? "dev",
      googleOAuth: {
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? null, 
        iosClientId: process.env.GOOGLE_IOS_CLIENT_ID ?? null,
        // Como aún no tengo SHA-1, se deja el Android en null o vacío.
        androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? null
      }
    }
  }
});
