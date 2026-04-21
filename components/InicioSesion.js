// screens/InicioSesion.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { showMessage } from "react-native-flash-message";
import { useVideoPlayer, VideoView } from "expo-video";
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import {
  signInEmail,
  sendReset,
  getSignInMethods,
} from "../services/authService";
import { getInitialSetupCompleted } from "../services/userProfileService";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { auth } from "../firebaseConfig";

const InicioSesion = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [mostrarCargando, setMostrarCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailReset, setEmailReset] = useState("");

  const passwordVisibility = () => setSecureTextEntry((v) => !v);

  // Fondo de video
  const videoSource = require("../assets/fondoInicio.mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
  });

  // Google Sign-In
  const { request, promptAsync } = useGoogleLogin();

  const iniciarSesion = async () => {
    setMostrarCargando(true);
    try {
      const { user } = await signInEmail(email, password);

      const providerId = user.providerData?.[0]?.providerId ?? "password";
      const userRef = doc(db, "users", user.uid);
      let snap = await getDoc(userRef);
      // Crea el doc si no existe
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: user.email ?? "",
          nombre: "",
          rol: "",
          profesion: "",
          telefono: "",
          photoURL: user.photoURL ?? "",
          createdAt: serverTimestamp(),
          provider: providerId,
          onboarding: {
            // si es password pediremos cambio la 1ª vez, en otros proveedores no
            passwordChanged: providerId !== "password",
            profileCompleted: false,
          },
          initialSetupCompleted: false, // si prefieres mantenerlo por compatibilidad
        });
        snap = await getDoc(userRef);
      }
      const data = snap.data() || {};
      const onboarding = data.onboarding || {};
      const needsPwd = providerId === "password" && !onboarding.passwordChanged;
      const needsProfile = !onboarding.profileCompleted;

      if (needsPwd) {
        // puedes pasar la siguiente ruta como param
        navigation.replace("PasswordChangeScreen", {
          next: needsProfile ? "DrawerNavi" : "TabInicio",
        });
        return;
      }

      if (needsProfile) {
        navigation.replace("DrawerNavi"); // directo, sin pantallas intermedias
        return;
      }
      navigation.replace('DrawerNavi');
     
    } catch (error) {
      console.log("Error al autenticar usuario:", error);
      let mensajeError;
      if (
        error.code === "firestore/permission-denied" ||
        /insufficient permissions/i.test(String(error))
      ) {
        mensajeError =
          "No tienes permisos para leer tu perfil. Contacta al administrador.";
      } else {
        switch (error.code) {
          case "auth/invalid-email":
            mensajeError = "El correo electrónico que ingresaste no es válido.";
            break;
          case "auth/user-disabled":
            mensajeError = "Este usuario ha sido deshabilitado.";
            break;
          case "auth/user-not-found":
            mensajeError =
              "No se encontró ninguna cuenta con este correo electrónico.";
            break;
          case "auth/wrong-password":
            mensajeError = "La contraseña que ingresaste es incorrecta.";
            break;
          case "auth/too-many-requests":
            mensajeError =
              "Por favor, inténtalo más tarde; has excedido el número de intentos.";
            break;
          case "auth/invalid-credential":
            // Puede ser password incorrecta o proyecto/config erróneos.
            mensajeError =
              "Credenciales inválidas. Verifica tu contraseña o consulta si tu cuenta fue creada en este proyecto.";
            break;
          default:
            mensajeError =
              "Lo sentimos, no se pudieron autenticar tus credenciales. Intenta nuevamente.";
        }
      }

      showMessage({
        message: "Error",
        description: mensajeError,
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 4000,
      });
    } finally {
      setMostrarCargando(false);
    }
  };

  const comprobarEmail = async () => {
    try {
      const methods = await getSignInMethods(emailReset);
      if (methods.length > 0) {
        await sendReset(emailReset);
        showMessage({
          message: "Éxito",
          description:
            "Enviamos un correo para restablecer tu contraseña. Revisa bandeja de entrada o spam.",
          type: "success",
          position: "top",
          icon: "success",
          duration: 6000,
        });
      } else {
        showMessage({
          message: "Error",
          description:
            "No se encontró ninguna cuenta registrada con este correo.",
          type: "danger",
          position: "top",
          icon: "danger",
          duration: 4000,
        });
      }
    } catch (error) {
      console.log("Error al comprobar el correo:", error);
      showMessage({
        message: "Error",
        description: "Ocurrió un error. Intenta de nuevo.",
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 4000,
      });
    }
  };

  return (
    <View style={estilos.container}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        resizeMode="cover"
        fullscreenOptions={{ enabled: false }}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />

      <View style={estilos.contenidoContainer}>
        <Image
          source={require("../assets/siredelogo1.png")}
          style={estilos.logo}
        />
        <TextInput
          style={estilos.inputsTexto}
          onChangeText={setEmail}
          value={email}
          color="#FFFFFF"
          placeholder="Correo electrónico"
          placeholderTextColor="#B3B3B3"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={estilos.inputContainer}>
          <TextInput
            style={estilos.inputsTexto}
            onChangeText={setPassword}
            value={password}
            color="#FFFFFF"
            placeholder="Contraseña"
            placeholderTextColor="#B3B3B3"
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={estilos.iconContainer}
            onPress={passwordVisibility}
          >
            <Ionicons
              name={secureTextEntry ? "eye-off" : "eye"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={estilos.olvideContrasenaContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={estilos.olvideContrasena}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {mostrarCargando ? (
          <View style={estilos.cargandoContainer}>
            <ActivityIndicator size="large" color="#696969" />
            <Text style={estilos.mensajeCargando}>Iniciando Sesión...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={estilos.boton}
              onPress={iniciarSesion}
              disabled={!email || !password}
            >
              <Text style={estilos.botonTexto}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* Google Sign-In */}
            <TouchableOpacity
              style={[estilos.boton, { marginTop: 12 }]}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Text style={estilos.botonTexto}>Continuar con Google</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={estilos.signupContainer}>
          <Text style={estilos.signupText}>¿No tienes tu cuenta aún?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccessRequest")}
          >
            <Text style={estilos.signupLink}>¡Solicita acceso aquí!</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <MaterialIcons name="password" size={100} color="#6D100A" />
            <Text style={estilos.titulo}>Restablecer Contraseña</Text>
            <Text style={estilos.subtitulo}>
              Ingresa el correo institucional con el que te registraste para
              restablecer tu contraseña.
            </Text>
            <TextInput
              style={estilos.modalInput}
              placeholder="Correo electrónico"
              placeholderTextColor="#696969"
              value={emailReset}
              onChangeText={setEmailReset}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={estilos.modalButton}
              onPress={comprobarEmail}
            >
              <Text style={estilos.modalButtonText}>Restablecer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                estilos.modalButton,
                { marginTop: 10, backgroundColor: "gray" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={estilos.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: "#E6E6FA",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  contenidoContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: { fontSize: 22, fontFamily: "Montserrat-Bold", color: "#6D100A" },
  subtitulo: {
    fontSize: 15,
    color: "#132F20",
    fontFamily: "Montserrat-Medium",
    textAlign: "justify",
    marginTop: 10,
    marginBottom: 10,
  },
  inputsTexto: {
    fontSize: 15,
    height: 45,
    width: 300,
    marginBottom: -3,
    borderWidth: 3,
    padding: 10,
    borderColor: "yellowgreen",
    color: "#FFFFFF",
    borderRadius: 10,
    fontFamily: "Montserrat-Medium",
  },
  logo: { width: 400, height: 75, resizeMode: "contain", marginBottom: 40 },
  cargandoContainer: { alignItems: "center", justifyContent: "center" },
  mensajeCargando: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Montserrat-Bold",
  },
  olvideContrasenaContainer: { marginTop: 10, marginBottom: 25 },
  olvideContrasena: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    fontFamily: "Montserrat-Medium",
  },
  botonTexto: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
  },
  boton: {
    backgroundColor: "rgba(250, 250, 250, 0.1)",
    padding: 10,
    borderRadius: 10,
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    width: 320,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalInput: {
    height: 45,
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    fontFamily: "Montserrat-Medium",
  },
  modalButton: {
    backgroundColor: "#6D100A",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  iconContainer: { position: "absolute", right: 20, top: 13 },
  signupContainer: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  /*  */
  signupText: {
    fontSize: 16,
    color: "#696969",
    fontFamily: "Montserrat-Medium",
  },
  signupLink: {
    fontSize: 16,
    color: "#C3D730",
    marginTop: 5,
    fontFamily: "Montserrat-Bold",
  },
});

export default InicioSesion;
