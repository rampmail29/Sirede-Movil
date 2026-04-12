// App.js
import "react-native-gesture-handler";
// Reanimated DEBE ir en el entry antes de cualquier otra import de React Navigation
import "react-native-reanimated";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import MainNavigator from "./components/MainNavigator";
import FlashMessage from "react-native-flash-message";

// acá se evitaa que el splash se oculte antes de tiempo
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("./assets/fonts/Montserrat/Montserrat-Bold.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    "Montserrat-Black": require("./assets/fonts/Montserrat/Montserrat-Black.ttf"),
    "Montserrat-Regular": require("./assets/fonts/Montserrat/Montserrat-Regular.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // Splash nativo visible

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
      <FlashMessage position="top" />
    </GestureHandlerRootView>
  );
}
