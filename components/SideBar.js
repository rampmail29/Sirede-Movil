import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  DrawerItemList,
  DrawerItem,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// 👇 Usa SIEMPRE las instancias únicas centralizadas
import { auth, db, storage } from "../firebaseConfig";

const SideBar = (props) => {
  const [imageUri, setImageUri] = useState(null);
  const [nombre, setNombre] = useState("");
  const [profesion, setProfesion] = useState("");
  const [rol, setRol] = useState("");
  const [superRol, setSuperRol] = useState("");
  const [uid, setUid] = useState("");
  const isDrawerOpen = useDrawerStatus() === "open";
  const isMounted = useRef(true);
  const userUnsubRef = useRef(null);

  // Intenta obtener imagen desde Storage si no hay photoURL en el perfil
  const obtenerImagenEstudiante = useCallback(async () => {
    if (!uid) return;
    try {
      const extensions = ["png", "jpg", "jpeg"];
      for (let ext of extensions) {
        const imageRef = ref(storage, `users/${uid}.${ext}`);
        try {
          const url = await getDownloadURL(imageRef);
          if (!isMounted.current) return;
          setImageUri(url);
          return;
        } catch {
          /* prueba siguiente extensión */
        }
      }
      // Si no encontró ninguna, no hacemos nada (queda placeholder)
    } catch (error) {
      console.error("Error al obtener la imagen del usuario:", error);
    }
  }, [uid]);

  // 1) Espera a que Auth esté listo
  useEffect(() => {
    isMounted.current = true;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!isMounted.current) return;

      // Limpia listener previo del doc si cambia de usuario
      if (userUnsubRef.current) {
        userUnsubRef.current();
        userUnsubRef.current = null;
      }

      if (user) {
        setUid(user.uid);
        // 2) Suscríbete al doc del usuario en Firestore en tiempo real
        const uRef = doc(db, "users", user.uid);
        userUnsubRef.current = onSnapshot(
          uRef,
          (snap) => {
            if (!isMounted.current) return;
            if (snap.exists()) {
              const data = snap.data() || {};
              setNombre(data.nombre || "");
              setProfesion(data.profesion || "");
              setRol(data.rol || "");
              setSuperRol(data.superRol || "");

              // Si en el doc existe photoURL se usa; si no, intenta buscar en Storage
              if (data.photoURL) {
                setImageUri(data.photoURL);
              } else {
                obtenerImagenEstudiante();
              }
            }
          },
          (err) => console.log("onSnapshot error:", err)
        );
      } else {
        // Sesión cerrada
        setUid("");
        setNombre("");
        setProfesion("");
        setRol("");
        setSuperRol("");
        setImageUri(null);
      }
    });

    return () => {
      isMounted.current = false;
      unsubAuth();
      if (userUnsubRef.current) {
        userUnsubRef.current();
        userUnsubRef.current = null;
      }
    };
  }, [obtenerImagenEstudiante]);

  // 3) Al abrir el drawer, refresca imagen desde Storage (por si fue cambiada)
  useEffect(() => {
    if (isDrawerOpen && uid && !imageUri) {
      obtenerImagenEstudiante();
    }
  }, [isDrawerOpen, uid, imageUri, obtenerImagenEstudiante]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/fondoinicio.jpg")}
        style={{ ...styles.backgroundImage, paddingTop: 48 }}
      >
        {imageUri ? (
          <View style={styles.imageContainer}>
            <ImageBackground source={{ uri: imageUri }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <FontAwesome name="user" size={60} color="#575756" />
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.name}>{nombre || "Cargando..."}</Text>
          {superRol === "admin" && (
            <MaterialIcons
              name="verified"
              size={20}
              color="#34531F"
              style={{ marginLeft: 5 }}
            />
          )}
        </View>

        <Text style={styles.rol}>{rol || "Cargando..."}</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.profesion}>{profesion || "Cargando..."}</Text>
        </View>
      </ImageBackground>

      <ScrollView>
        <View
          style={styles.container}
          forceInset={{ top: "always", horizontal: "never" }}
        >
          {superRol === "admin" ? (
            <DrawerItemList {...props} />
          ) : (
            <>
              {props.state.routes.map((route) => {
                if (route.name !== "Cargar CSV") {
                  return (
                    <DrawerItem
                      key={route.name}
                      label={route.name}
                      onPress={() => props.navigation.navigate(route.name)}
                      style={{
                        ...props.drawerItemStyle,
                        backgroundColor:
                          route.name ===
                          props.state.routeNames[props.state.index]
                            ? "#C3D730"
                            : "#F0FFF2",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                      }}
                      labelStyle={{
                        fontSize: 16,
                        fontFamily: "Montserrat-Medium",
                        color:
                          route.name ===
                          props.state.routeNames[props.state.index]
                            ? "#34531F"
                            : "#B3B3B3",
                      }}
                      icon={({ focused, color, size }) => {
                        let iconName;
                        if (route.name === "Perfil")
                          iconName = focused ? "person" : "person-outline";
                        else if (route.name === "SireBot")
                          iconName = focused
                            ? "chatbox-ellipses"
                            : "chatbox-ellipses-outline";
                        else if (route.name === "Reporte")
                          iconName = focused
                            ? "clipboard"
                            : "clipboard-outline";
                        else if (route.name === "Acerca de")
                          iconName = focused
                            ? "information-circle"
                            : "information-circle-outline";
                        else if (route.name === "Cargar CSV")
                          iconName = focused
                            ? "cloud-upload"
                            : "cloud-upload-outline";
                        return (
                          <Ionicons name={iconName} size={size} color={color} />
                        );
                      }}
                    />
                  );
                }
                return null;
              })}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => props.navigation.navigate("CerrarSesion")}
        style={styles.bottomDrawerSection}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-end",
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={25}
            color="black"
            style={styles.iconStyles}
          />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: {
    width: undefined,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
  },
  name: { color: "#C3D730", fontSize: 20, fontFamily: "Montserrat-Bold" },
  rol: { color: "#132F20", fontSize: 13, fontFamily: "Montserrat-Medium" },
  profesion: {
    color: "#132F20",
    fontSize: 13,
    fontFamily: "Montserrat",
    marginRight: 5,
  },
  bottomDrawerSection: {
    borderTopColor: "#34531F",
    borderTopWidth: 0.5,
    flexDirection: "row",
    padding: 16,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
  },
  iconStyles: { marginLeft: 10, color: "#C3D730" },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "#F0FFF2",
    elevation: 10,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 5,
    borderColor: "#F0FFF2",
    elevation: 10,
  },
});

export default SideBar;
