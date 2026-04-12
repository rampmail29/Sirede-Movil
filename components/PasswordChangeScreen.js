import React, { useState, useEffect, useMemo } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showMessage } from "react-native-flash-message";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useRoute } from "@react-navigation/native";

const PasswordChangeScreen = ({ navigation }) => {
  const route = useRoute();
  const next = route.params?.next ?? "InfoPerfilScreen";
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const { height: windowHeight } = useWindowDimensions();
  const isSmallScreen = windowHeight < 750;

  // Animaciones
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    }),
    transform: [
      {
        translateY: withTiming(translateY.value, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  useEffect(() => {
    opacity.value = 1;
    translateY.value = 0;
  }, []);

  const passwordVisibility = () => setSecureTextEntry((v) => !v);

  const validators = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword;
    return { hasMinLength, hasUpperCase, hasNumber, passwordsMatch };
  }, [password, confirmPassword]);

  const reauthenticateIfNeeded = async () => {
    // Si tienes el flujo para pedir la contraseña actual, se usa aquí.
    // Ejemplo:
    // const currentPassword = await askUserForCurrentPassword(); // <- modal propio
    // if (!currentPassword) return false;
    // const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    // await reauthenticateWithCredential(auth.currentUser, cred);
    // return true;

    // Si no se va a pedir la contraseña actual, se redirige a Inicio de sesión:
    navigation.replace("InicioSesion");
    return false;
  };

  const passwordUpdate = async (newPassword) => {
    if (loading) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        showMessage({
          message: "Error",
          description: "No hay usuario autenticado.",
          type: "danger",
          position: "top",
          icon: "danger",
          duration: 3000,
        });
        return;
      }
      // 1) Reautenticación
      if (!currentPassword) {
        showMessage({
          message: "Falta contraseña actual",
          description: "Ingresa tu contraseña actual para continuar.",
          type: "warning",
          position: "top",
        });
        setLoading(false);
        return;
      }
      if (currentPassword === newPassword) {
        showMessage({
          message: "Contraseña inválida",
          description: "La nueva contraseña no puede ser igual a la actual.",
          type: "warning",
          position: "top",
        });
        setLoading(false);
        return;
      }
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      //2. Update
      await updatePassword(user, newPassword);
      // 3) Marca el onboarding
      await updateDoc(doc(db, "users", user.uid), {
        "onboarding.passwordChanged": true,
        passwordChangedAt: serverTimestamp(),
      });

      showMessage({
        message: "Éxito",
        description: "Tu contraseña fue actualizada correctamente.",
        type: "success",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
        icon: "success",
        duration: 2000,
        position: "top",
      });

      setTimeout(() => navigation.replace(next), 2000);
    } catch (error) {
      console.log("Error al actualizar la contraseña:", error);
      if (error?.code === "auth/requires-recent-login") {
        showMessage({
          message: "Sesión expirada",
          description:
            "Por seguridad, vuelve a iniciar sesión para cambiar tu contraseña.",
          type: "warning",
          position: "top",
          icon: "warning",
          duration: 3500,
        });
        await reauthenticateIfNeeded();
        return;
      }

      showMessage({
        message: "Error",
        description:
          "Lo sentimos, no se pudo actualizar tu contraseña. Intenta nuevamente.",
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const { hasMinLength, hasUpperCase, hasNumber, passwordsMatch } = validators;
  const canSubmit =
    hasMinLength && hasUpperCase && hasNumber && passwordsMatch && !loading;

  return (
    <ImageBackground
      source={require("../assets/fondoinicio.jpg")}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={animatedStyle}>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="security"
                size={120}
                color="#132F20"
              />
            </View>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Por tu seguridad es momento de cambiar la contraseña de tu cuenta.
            </Text>
          </Animated.View>

          <Animated.View style={animatedStyle2}>
            <Text style={styles.text}>Digite la nueva Contraseña: </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña actual"
                secureTextEntry={secureTextEntry}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={passwordVisibility}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={20}
                  color="#132F20"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                textContentType="newPassword"
              />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={passwordVisibility}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={20}
                  color="#132F20"
                />
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.validationContainer1}>
                <ValidationItem
                  isValid={hasMinLength}
                  text="Como mínimo 8 caracteres"
                />
                <ValidationItem
                  isValid={hasUpperCase}
                  text="Al menos una letra mayúscula"
                />
                <ValidationItem
                  isValid={hasNumber}
                  text="Debe incluir un número"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  isFocused &&
                    password.length > 0 &&
                    !passwordsMatch &&
                    styles.inputFocusedFalse,
                  isFocused &&
                    password.length > 0 &&
                    passwordsMatch &&
                    styles.inputFocusedTrue,
                ]}
                placeholder="Confirmar nueva contraseña"
                secureTextEntry={secureTextEntry}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                textContentType="newPassword"
              />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={passwordVisibility}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={20}
                  color="#132F20"
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <View style={styles.validationContainer2}>
                <ValidationItem
                  isValid={passwordsMatch}
                  text={
                    passwordsMatch
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"
                  }
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                canSubmit ? styles.buttonEnabled : styles.buttonDisabled,
              ]}
              disabled={!canSubmit}
              onPress={() => passwordUpdate(password)}
            >
              <Text style={styles.buttonText}>
                {loading ? "Actualizando…" : "Actualizar Contraseña"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOmitir}
              onPress={() => navigation.replace("InitialSetupScreen")}
            >
              <Text style={styles.buttonTextOmitir}>Omitir</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const ValidationItem = ({ isValid, text }) => (
  <View style={styles.validationItem}>
    <Feather
      name={isValid ? "check-circle" : "x-circle"}
      size={20}
      color={isValid ? "green" : "red"}
    />
    <Text
      style={[styles.validationText, isValid ? styles.valid : styles.invalid]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: "cover" },
  container: { flex: 1, padding: 30 },
  title: {
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginTop: 10,
    color: "#C3D730",
  },
  titleSmall: { fontSize: 35, marginTop: 0 },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#132F20",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontFamily: "Montserrat-Medium",
    fontSize: 15,
    backgroundColor: "white",
  },
  validationContainer1: {},
  validationContainer2: {},
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  validationText: { marginLeft: 8, fontSize: 16, fontFamily: "Montserrat" },
  valid: { color: "green" },
  invalid: { color: "red" },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonOmitir: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#132F20",
    marginTop: 10,
  },
  buttonEnabled: { backgroundColor: "#4CAF50" },
  buttonDisabled: { backgroundColor: "#B3B3B3" },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "Montserrat-Bold" },
  buttonTextOmitir: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
  },
  icon: { alignItems: "center", marginTop: 30 },
  text: {
    marginTop: 30,
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: "#132F20",
    marginBottom: 5,
  },
  inputFocusedFalse: {
    borderColor: "red",
    shadowColor: "red",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  inputFocusedTrue: {
    borderColor: "green",
    shadowColor: "green",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  iconContainer: { position: "absolute", right: 20, top: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
  },
});

export default PasswordChangeScreen;
