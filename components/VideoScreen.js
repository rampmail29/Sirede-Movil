// VideoScreen.js
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function VideoScreen() {
  const navigation = useNavigation();
  const videoSource = require("../assets/entradauts.mp4");
  const videoRef = useRef(null);
  const [didNavigate, setDidNavigate] = useState(false);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    let interval;
    const tick = () => {
      try {
        const t = player.currentTime ?? 0;
        const d = player.duration ?? 0;
        // navego cuando falten <300ms
        if (!didNavigate && d > 0 && t >= d - 0.3) {
          setDidNavigate(true);
          // IMPORTANTE: uso replace a un screen que Sí existe en el Stack
          navigation.replace("InicioSesion"); // <-- primero al login
        }
      } catch {}
    };
    interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [player, didNavigate, navigation]);

  return (
    <View style={styles.container}>
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        resizeMode="cover"
        fullscreenOptions={{ enabled: false }}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
