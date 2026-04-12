import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// 👇 Usa SIEMPRE las instancias únicas centralizadas
import { auth, db } from "../firebaseConfig";

const Reportes = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [uid, setUid] = useState("");
  const [mostrarTitulos, setMostrarTitulos] = useState(true);
  const [alturaTextArea, setAlturaTextArea] = useState(80);
  const [envioExitoso, setEnvioExitoso] = useState(false);
  const [mostrarMensajes, setMostrarMensajes] = useState(false);
  const [contador, setContador] = useState(5);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        if (!isMounted.current) return;
        setEmail(user.email ?? "");
        setUid(user.uid);

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && isMounted.current) {
          const data = snap.data();
          setNombre(data?.nombre || "");
        }
      } catch (error) {
        console.log("Error al cargar los datos del usuario:", error);
      }
    };

    loadUserData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const guardarReporteEnFirestore = async () => {
    const reportesRef = collection(db, "reportes");
    await addDoc(reportesRef, {
      uid,
      nombre,
      correo: email,
      mensaje,
      plataforma: Platform.OS,
      timestamp: serverTimestamp(),
    });
  };

  const enviarReporte = async () => {
    if (!mensaje?.trim()) {
      showMessage({
        message: "Faltan datos",
        description:
          "Por favor, describe el problema para poder enviar el reporte.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
        icon: "danger",
        duration: 3000,
        position: "top",
      });
      return;
    }

    try {
      await guardarReporteEnFirestore();
      if (!isMounted.current) return;

      setEnvioExitoso(true);
      setMostrarMensajes(true);
      setMostrarTitulos(false);
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      showMessage({
        message: "Error",
        description: "No se pudo enviar el reporte. Intenta de nuevo.",
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!envioExitoso) return;

    const timer = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      setMostrarMensajes(false);
      clearInterval(timer);
      setEnvioExitoso(false);
      navigation.replace("TabInicio");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [envioExitoso, navigation]);

  const primerNombre = (nombre || "").split(" ")[0] || "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container1}
    >
      <ImageBackground
        source={require("../assets/fondoinicio.jpg")}
        style={styles.background}
      >
        <View style={styles.container}>
          {mostrarTitulos ? (
            <>
              <View>
                <Text style={styles.titulo}>Reportar un Problema</Text>
                <Text style={styles.subtitulo}>
                  ¡{primerNombre || "Usuario"}, tu retroalimentación es valiosa
                  para nosotros!
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  { height: Math.max(130, alturaTextArea) },
                ]}
                placeholder="Describe el problema"
                onChangeText={setMensaje}
                value={mensaje}
                multiline
                onContentSizeChange={(e) => {
                  setAlturaTextArea(e.nativeEvent.contentSize.height);
                }}
              />

              <TouchableOpacity style={styles.boton} onPress={enviarReporte}>
                <Text style={styles.botonTexto}>Enviar Reporte</Text>
              </TouchableOpacity>
            </>
          ) : (
            mostrarMensajes && (
              <>
                <Text style={styles.mensajeExitoso}>
                  Reporte enviado exitosamente. ¡Gracias por tu colaboración!
                </Text>
                <Text style={styles.mensajeRedireccion}>
                  Serás redirigido a la página principal en {contador} segundos.
                </Text>
              </>
            )
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container1: { flex: 1 },
  background: { flex: 1, resizeMode: "cover" },
  container: {
    backgroundColor: "#F0FFF2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: "auto",
    marginRight: 30,
    marginLeft: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20,
  },
  input: {
    fontSize: 14,
    height: 40,
    width: 260,
    margin: 10,
    padding: 10,
    borderColor: "#132F20",
    borderWidth: 2,
    borderRadius: 8,
    fontFamily: "Montserrat-Medium",
    textAlignVertical: "top",
  },
  mensajeExitoso: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6D100A",
    marginBottom: 10,
    fontFamily: "Montserrat-Bold",
  },
  mensajeRedireccion: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Montserrat-Medium",
  },
  titulo: {
    fontSize: 30,
    color: "#C3D730",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Montserrat-Bold",
  },
  subtitulo: {
    fontSize: 19,
    color: "#34531F",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Montserrat-Medium",
  },
  botonTexto: {
    fontSize: 15,
    color: "#F0FFF2",
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
  },
  boton: {
    backgroundColor: "#C3D730",
    padding: 10,
    borderRadius: 30,
  },
});

export default Reportes;
