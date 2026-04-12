import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logOut } from "../services/authService";

const CerrarSesion = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const signedOutRef = useRef(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Interval solo para UI (contador)
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Timeout para ejecutar el sign-out una sola vez
    timeoutRef.current = setTimeout(() => {
      handleSignOut();
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSignOut = async () => {
    if (signedOutRef.current) return; // evitar doble ejecución
    signedOutRef.current = true;

    try {
      await logOut();
      setModalVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "InicioSesion" }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Podrías mostrar un toast si quieres
    } finally {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/fondocerrar.jpg")}
      style={styles.backgroundImage}
    >
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="log-out-outline"
              size={50}
              color="#FF6347"
              style={styles.icon}
            />
            <Text style={styles.modalTitle}>
              ¡Gracias por visitar SiredeMovil!
            </Text>
            <Text style={styles.modalMessage}>
              Tu cuenta se cerrará en {countdown} segundos.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Cerrar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: "cover" },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  icon: { marginBottom: 20 },
  modalTitle: {
    fontSize: 25,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FF6347",
    borderRadius: 5,
  },
  buttonText: { color: "white", fontFamily: "Montserrat-Bold" },
});

export default CerrarSesion;
