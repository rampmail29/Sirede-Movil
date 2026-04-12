import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";

import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { FontAwesome } from "@expo/vector-icons";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";

// instancias únicas
import { auth, db, storage } from "../firebaseConfig";

const InfoPerfilScreen = ({ onNext }) => {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const [imageUri, setImageUri] = useState(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [profesion, setProfesion] = useState("");
  const [rol, setRol] = useState("");
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);
  const [initialSetupCompleted, setInitialSetupCompleted] = useState(true);

  const isMounted = useRef(true);
  
  const isSmallScreen = windowHeight < 750;

  useEffect(() => {
    isMounted.current = true;
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          showMessage({
            message: "Error",
            description: "No hay un Usuario registrado.",
            type: "danger",
            titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
            textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
            icon: "danger",
            duration: 2500,
            position: "top",
          });
          return;
        }

        if (!isMounted.current) return;

        setUid(user.uid);
        setEmail(user.email ?? "");
        if (user.photoURL) setImageUri(user.photoURL);

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!isMounted.current) return;
          setNombre(data.nombre ?? "");
          setTelefono(data.telefono ?? "");
          setProfesion(data.profesion ?? "");
          setRol(data.rol ?? "");
          if (data.photoURL && !user.photoURL) setImageUri(data.photoURL);
          // --- CHEQUEO: si ya está completo, saltamos esta pantalla ---
          const alreadyComplete = Boolean(
            data.nombre && data.rol && data.profesion
          );
          if (alreadyComplete) {
            // Opción A: si el padre controla el paso siguiente
            if (typeof onNext === "function") {
              onNext();
            } else {
              // Opción B: navegar directo
              navigation.replace("TabInicio");
            }
            return;
          }
        } else {
          console.log("El documento del usuario no existe.");
        }
      } catch (error) {
        console.log("Error al cargar los datos del usuario:", error);
        showMessage({
          message: "Error",
          description: "Hubo un problema al cargar los datos del usuario.",
          type: "danger",
          titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
          textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
          icon: "danger",
          duration: 2500,
          position: "top",
        });
      }
    };

    loadUserData();
    return () => {
      isMounted.current = false;
    };
  }, [onNext, navigation]);

  // Añade a tus imports:
  // import { doc, updateDoc, setDoc /*, serverTimestamp */ } from 'firebase/firestore';
  // y si no lo tienes ya: import { useNavigation } from '@react-navigation/native';

  const guardar = async () => {
    if (!nombre || !profesion || !rol) {
      showMessage({
        message: "Faltan datos",
        description: "Por favor, complete todos los campos obligatorios.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
        icon: "danger",
        duration: 3000,
        position: "top",
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No hay un usuario registrado.");
        setLoading(false);
        return;
      }

      // --- Auth profile ---
      const authPatch = { displayName: nombre };
      if (imageUri) authPatch.photoURL = imageUri;
      await updateProfile(user, authPatch);

      // --- Firestore ---
      const userRef = doc(db, "users", user.uid);
      const payload = {
        nombre,
        telefono,
        profesion,
        rol,
        initialSetupCompleted: true,
        // updatedAt: serverTimestamp(), // <- opcional si importas serverTimestamp
        ...(imageUri ? { photoURL: imageUri } : {}),
      };

      try {
        // Usa dot-notation para no pisar otros campos dentro de "onboarding"
        await updateDoc(userRef, {
          ...payload,
          "onboarding.profileCompleted": true,
        });
      } catch (err) {
        // Si el doc no existe aún, lo creamos con merge
        // not-found: no document to update
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email ?? null,
            ...payload,
            onboarding: { profileCompleted: true },
          },
          { merge: true }
        );
      }

      showMessage({
        message: "Perfil actualizado",
        type: "success",
        position: "top",
        icon: "success",
        duration: 1800,
      });

      setTimeout(() => {
        if (!isMounted.current) return;
        setLoading(false);
        if (typeof onNext === "function") onNext();
        else navigation.replace("TabInicio");
      }, 800);
    } catch (error) {
      console.log("Error al actualizar el perfil:", error);
      showMessage({
        message: "Error",
        description: "No se pudo actualizar el perfil. Inténtelo de nuevo.",
        type: "danger",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
        icon: "danger",
        duration: 2500,
        position: "top",
      });
      if (isMounted.current) setLoading(false);
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const resizedUri = await resizeImage(uri);
        await uploadImage(resizedUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Error al redimensionar la imagen:", error);
      return uri;
    }
  };

  const uploadImage = async (uri) => {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();

      // Intenta inferir extensión por la uri
      const extMatch = (uri.split("?")[0] || "").match(/\.(\w+)$/i);
      const ext = (extMatch?.[1] || "jpg").toLowerCase();

      const storageRef = ref(storage, `users/${uid}.${ext}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      if (!isMounted.current) return;

      setImageUri(url);

      // Guarda photoURL en Auth y en Firestore para tenerlo centralizado
      const user = auth.currentUser;
      if (user) {
        try {
          await updateProfile(user, { photoURL: url });
        } catch {}
        const userRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userRef, { photoURL: url });
        } catch {}
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      showMessage({
        message: "Error",
        description: "No se pudo subir la imagen.",
        type: "danger",
        icon: "danger",
        duration: 2500,
        position: "top",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={[
          styles.container,
          isSmallScreen && styles.containerPantalla2Small,
        ]}
      >
        <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
          Completa la información de tu perfil.
        </Text>

        {imageUri ? (
          <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
            <ImageBackground source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.editIcon}>
              <FontAwesome name="edit" size={20} color="#34531F" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
            <View style={styles.imagePlaceholder}>
              <FontAwesome name="user" size={70} color="#6D100A" />
              <Text style={styles.uploadText}>Subir Foto</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.textName}>{email}</Text>

        <View style={styles.linea}>
          <View style={styles.separator1} />
        </View>

        <View>
          <View style={styles.fieldContainer}>
            <Text style={styles.asterisk}>*</Text>
            <Text style={styles.infoText}>Nombre:</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              isSmallScreen && styles.inputSmall,
              isFocused1 && styles.inputFocused,
            ]}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            onFocus={() => setIsFocused1(true)}
            onBlur={() => setIsFocused1(false)}
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.asterisk}>*</Text>
            <Text style={styles.infoText}>Cargo:</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              isSmallScreen && styles.inputSmall,
              isFocused2 && styles.inputFocused,
            ]}
            placeholder="Rol"
            value={rol}
            onChangeText={setRol}
            onFocus={() => setIsFocused2(true)}
            onBlur={() => setIsFocused2(false)}
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.asterisk}>*</Text>
            <Text style={styles.infoText}>Profesión:</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              isSmallScreen && styles.inputSmall,
              isFocused3 && styles.inputFocused,
            ]}
            placeholder="Carrera o Profesión"
            value={profesion}
            onChangeText={setProfesion}
            onFocus={() => setIsFocused3(true)}
            onBlur={() => setIsFocused3(false)}
          />

          <Text style={styles.infoText}>Teléfono: </Text>
          <TextInput
            style={[
              styles.input,
              isSmallScreen && styles.inputSmall,
              isFocused4 && styles.inputFocused,
            ]}
            placeholder="Nᵒ de Celular"
            value={telefono}
            onChangeText={setTelefono}
            onFocus={() => setIsFocused4(true)}
            onBlur={() => setIsFocused4(false)}
          />
        </View>

        <TouchableOpacity
          style={[styles.sig, isSmallScreen && styles.sigSmall]}
          onPress={guardar}
        >
          <Text style={styles.guardar}>Guardar Cambios</Text>
        </TouchableOpacity>

        <Modal animationType="fade" transparent visible={loading}>
          <View className="modalContainer" style={styles.modalContainer}>
            {loading && (
              <View>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Actualizando Datos...</Text>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30 },
  containerPantalla2Small: { padding: 0, margin: -20 },
  title: {
    fontSize: 35,
    fontFamily: "Montserrat-Bold",
    marginTop: 35,
    marginBottom: 0,
    color: "#6D100A",
  },
  titleSmall: { fontSize: 35, marginTop: 0 },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    elevation: 10,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 8,
    borderColor: "#f1f1f1",
    elevation: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 120,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(250, 250, 250, 0.2)",
    borderWidth: 5,
    borderColor: "#6D100A",
  },
  uploadText: { fontFamily: "Montserrat-Medium", color: "#6D100A" },
  textName: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginTop: 10,
    textAlign: "center",
    color: "#6D100A",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#6D100A",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 10,
    fontFamily: "Montserrat-Medium",
    fontSize: 18,
  },
  inputFocused: {
    borderColor: "#6D100A",
    shadowColor: "#6D100A",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  inputSmall: { fontSize: 17, width: "100%", height: 50 },
  infoText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 19,
    marginBottom: 2,
    color: "#6d100a",
  },
  separator1: {
    height: 2,
    width: "70%",
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6D100A",
    marginVertical: 5,
    borderRadius: 200,
  },
  linea: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  sig: {
    alignItems: "center",
    left: 0,
    right: 0,
    backgroundColor: "#6D100A",
    padding: 15,
    borderRadius: 50,
    marginTop: 10,
  },
  guardar: { fontFamily: "Montserrat-Bold", fontSize: 20, color: "white" },
  sigSmall: { alignItems: "center", left: 0, right: 0 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  fieldContainer: { flexDirection: "row", alignItems: "center" },
  asterisk: {
    color: "red",
    fontFamily: "Montserrat-Bold",
    fontSize: 19,
    marginRight: 2,
  },
});

export default InfoPerfilScreen;
