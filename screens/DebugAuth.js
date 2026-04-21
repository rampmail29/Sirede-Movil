import React from "react";
import { View, Button } from "react-native";
import { auth } from "../firebaseConfig";
import { signInAnonymously } from "firebase/auth";

export default function DebugAuth() {
  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Test Auth"
        onPress={async () => {
          try {
            const res = await signInAnonymously(auth);
            //console.log("Anon UID:", res.user.uid);
          } catch (e) {
            console.log("Auth error:", e);
          }
        }}
      />
    </View>
  );
}
