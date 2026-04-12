import React, { useEffect, useRef, useState } from "react";
import {
  useWindowDimensions,
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { FontAwesome } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

// 👇 Usa SIEMPRE las instancias únicas centralizadas
import { auth, db, storage } from "../firebaseConfig";

const Perfil = () => {
  const { height: windowHeight } = useWindowDimensions();
  const [imageUri, setImageUri] = useState(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [profesion, setProfesion] = useState("");
  const [rol, setRol] = useState("");
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);
  const [loading, setLoading] = useState(false); // Modal de “Actualizando…”
  const [loading2, setLoading2] = useState(true); // Pantalla “Cargando…”
  const isSmallScreen = windowHeight < 750;

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email ?? "");
          setUid(user.uid);

          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (!isMounted.current) return;

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNombre(userData.nombre || "");
            setTelefono(userData.telefono || "");
            setProfesion(userData.profesion || "");
            setRol(userData.rol || "");
            // Preferimos photoURL de Auth; si no, usa la guardada en Firestore
            if (user.photoURL) setImageUri(user.photoURL);
            else if (userData.photoURL) setImageUri(userData.photoURL);
          }
        }
      } catch (error) {
        console.log("Error al cargar los datos del usuario:", error);
      } finally {
        if (isMounted.current) setLoading2(false);
      }
    };

    loadUserData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const obtenerImagen = async () => {
      try {
        // Si ya hay photoURL, no intentes descubrir por extensión
        if (imageUri) return;

        const exts = ["png", "jpg", "jpeg"];
        for (let ext of exts) {
          const imageRef = ref(storage, `users/${uid}.${ext}`);
          try {
            const url = await getDownloadURL(imageRef);
            if (!isMounted.current) return;
            setImageUri(url);
            break;
          } catch {
            // prueba siguiente extensión
          }
        }
      } catch (error) {
        console.error("Error al obtener la imagen del usuario:", error);
      }
    };

    if (uid) obtenerImagen();
  }, [uid]);

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
      const out = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return out.uri;
    } catch (error) {
      console.error("Error al redimensionar la imagen:", error);
      return uri;
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Intenta inferir extensión desde la URI; si no, usa jpg
      const extMatch = (uri.split("?")[0] || "").match(/\.(\w+)$/i);
      const ext = (extMatch?.[1] || "jpg").toLowerCase();

      const storageRef = ref(storage, `users/${uid}.${ext}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      if (!isMounted.current) return;

      setImageUri(url);

      // Actualiza photoURL en Auth y en Firestore
      const user = auth.currentUser;
      if (user) {
        try {
          await updateProfile(user, { photoURL: url });
        } catch {}
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { photoURL: url });
        } catch {}
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      showMessage({
        message: "Error",
        description: "No se pudo subir la imagen.",
        type: "danger",
        position: "top",
        icon: "danger",
        duration: 2500,
      });
    }
  };

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

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No hay un usuario registrado.");
        setLoading(false);
        return;
      }

      // Actualiza nombre visible (displayName)
      await updateProfile(user, { displayName: nombre });

      // Actualiza Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        nombre,
        telefono,
        profesion,
        rol,
        ...(imageUri ? { photoURL: imageUri } : {}),
      });

      setTimeout(() => {
        if (isMounted.current) setLoading(false);
      }, 1200);
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {loading2 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34531F" />
          <Text style={styles.loadingTextInline}>Cargando...</Text>
        </View>
      ) : (
        <>
          <ImageBackground
            source={require("../assets/fondoinicio.jpg")}
            style={styles.backgroundImage}
          >
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.container}>
                <Text style={styles.title}>Información de Perfil</Text>

                <View style={styles.infoContainer}>
                  {imageUri ? (
                    <TouchableOpacity
                      style={styles.imageContainer}
                      onPress={selectImage}
                    >
                      <ImageBackground
                        source={{ uri: imageUri }}
                        style={styles.image}
                      />
                      <View style={styles.editIcon}>
                        <FontAwesome name="edit" size={20} color="#34531F" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.imageContainer}
                      onPress={selectImage}
                    >
                      <View style={styles.imagePlaceholder}>
                        <FontAwesome name="user" size={60} color="#575756" />
                        <Text style={styles.uploadText}>Subir Foto</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <View style={styles.cuerpo}>
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

                    <View className="field" style={styles.fieldContainer}>
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
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.infoText}>Email:</Text>
                    <TextInput
                      style={[
                        styles.inputDisable,
                        isSmallScreen && styles.inputSmall,
                      ]}
                      placeholder="Correo Electrónico"
                      value={email}
                      onChangeText={setEmail}
                      editable={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.sig, isSmallScreen && styles.sigSmall]}
                    onPress={guardar}
                  >
                    <Text style={styles.guardar}>Guardar Cambios</Text>
                  </TouchableOpacity>

                  {/* Modal para mostrar la pantalla de carga */}
                  <Modal animationType="fade" transparent visible={loading}>
                    <View style={styles.modalContainer}>
                      {loading && (
                        <View>
                          <ActivityIndicator size="large" color="white" />
                          <Text style={styles.loadingTextOverlay}>
                            Actualizando Datos...
                          </Text>
                        </View>
                      )}
                    </View>
                  </Modal>
                </View>
              </View>
            </ScrollView>
          </ImageBackground>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, resizeMode: "cover" },
  scrollView: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "flex-start", alignItems: "center" },
  title: {
    fontSize: 40,
    padding: 30,
    fontFamily: "Montserrat-Bold",
    alignSelf: "flex-start",
    marginBottom: 50,
    color: "#C3D730",
  },
  infoContainer: {
    backgroundColor: "rgba(240,255,242,.7)",
    padding: 20,
    borderTopLeftRadius: 90,
    marginBottom: 20,
    width: "100%",
    height: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: -100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 8,
    borderColor: "white",
    elevation: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
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
    width: 130,
    height: 130,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 8,
    borderColor: "white",
    elevation: 10,
  },
  uploadText: { fontFamily: "Montserrat-Medium", color: "#34531F" },

  // Loader de pantalla completa inicial
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingTextInline: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
    color: "#34531F",
  },

  input: {
    height: 37,
    width: "100%",
    borderColor: "#132F20",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 10,
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
  },
  inputDisable: {
    height: 37,
    borderColor: "#6D100A",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#e2e2e2",
    borderRadius: 10,
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "#132F20",
    shadowColor: "#132F20",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  inputSmall: { fontSize: 17, width: "100%", height: 50 },
  infoText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    marginBottom: 2,
    color: "#34531F",
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
    backgroundColor: "#C3D730",
    padding: 10,
    borderRadius: 50,
  },
  guardar: { fontFamily: "Montserrat-Bold", fontSize: 18, color: "white" },
  sigSmall: { alignItems: "center", left: 0, right: 0 },

  // Overlay del modal de actualización
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingTextOverlay: {
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
  cuerpo: { width: "100%", padding: 20 },
});

export default Perfil;
