// StudentDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { FontAwesome } from "@expo/vector-icons";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { API_BASE_URL } from "./Config";

/* ============================
   COMPONENTE REUTILIZABLE
============================ */

const InfoItem = ({ icon, size = 30, color, label, value, labelStyle }) => {
  return (
    <View style={styles.infoItem1}>
      <FontAwesome name={icon} size={size} color={color} />
      <View>
        <Text style={labelStyle || styles.label}>{label}</Text>
        <Text style={styles.text}>{value}</Text>
      </View>
    </View>
  );
};

const StudentDetail = ({ route, navigation }) => {
  const { id, fromScreen } = route.params || {};

  let selectedCorteInicial,
    corteFinal,
    programaSeleccionado,
    datosBackend,
    graduacionOportuna,
    graduadosOportunos,
    tipoProgramaSeleccionado,
    idSeleccionado,
    tipoInforme,
    datos;

  if (fromScreen === "GraficarCohorte") {
    selectedCorteInicial = route.params.selectedCorteInicial;
    corteFinal = route.params.corteFinal;
    programaSeleccionado = route.params.programaSeleccionado;
    datosBackend = route.params.datosBackend;
    graduacionOportuna = route.params.graduacionOportuna;
    graduadosOportunos = route.params.graduadosOportunos;
    tipoProgramaSeleccionado = route.params.tipoProgramaSeleccionado;
    idSeleccionado = route.params.idSeleccionado;
  }

  if (fromScreen === "GraficarPdf") {
    tipoInforme = route.params.tipoInforme;
    datos = route.params.datos;
  }

  const [student, setStudent] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ============================
        HELPERS
  ============================ */

  const justCapitalLetter = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join(" ");
  };

  const capitalLetter = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .trim()
      .split(/\s+/)
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const safeText = (str) =>
    str && typeof str === "string" ? str : "No disponible";

  const formatDate = (dateString) =>
    typeof dateString === "string" && dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString || "No disponible";

  const safeDate = (dateStr) =>
    dateStr ? formatDate(dateStr) : "No disponible";

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No disponible";

    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);

    if (isNaN(fechaNac.getTime())) return "No disponible";

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return `${edad} años`;
  };

  const ordenarCarrerasPorFecha = (carreras) => {
    if (!Array.isArray(carreras)) return [];

    return [...carreras].sort((a, b) => {
      const fa = new Date(a.fecha_matricula || a.fecha_ingreso || "");
      const fb = new Date(b.fecha_matricula || b.fecha_ingreso || "");
      return fa - fb;
    });
  };

  const obtenerUltimoEstadoAcademico = (carrera) => {
    try {
      if (!carrera?.historico_estado?.length) return "No disponible";

      const ultimo =
        carrera.historico_estado[carrera.historico_estado.length - 1];

      return (
        ultimo
          ?.estados_academicos_historico_estado_estado_nuevo_idToestados_academicos
          ?.nombre_estado || "No disponible"
      );
    } catch {
      return "No disponible";
    }
  };

  /* ============================
        NAVEGACIÓN VOLVER
  ============================ */

  const volverNavigation = () => {
    if (fromScreen === "GraficarCohorte") {
      navigation.navigate("GraficarCohorte", {
        fromScreen: "Estadis_Cohorte",
        selectedCorteInicial,
        corteFinal,
        programaSeleccionado,
        datosBackend,
        graduacionOportuna,
        graduadosOportunos,
        tipoProgramaSeleccionado,
        idSeleccionado,
      });
    } else if (fromScreen === "InformeEstudiante") {
      navigation.navigate("InformeEstudiante");
    } else if (fromScreen === "GraficarPdf") {
      navigation.navigate("GraficarPdf", {
        tipoInforme,
        datos,
      });
    } else {
      navigation.goBack();
    }
  };

  /* ============================
        FETCH ESTUDIANTE
  ============================ */

  useEffect(() => {
    const obtenerDetallesEstudiante = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/obtener/${id}`);
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("Error al obtener estudiante:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    obtenerDetallesEstudiante();
  }, [id]);

  /* ============================
        CARGAR FOTO FIREBASE
  ============================ */

  useEffect(() => {
    const obtenerImagenEstudiante = async () => {
      try {
        if (!student) return;

        const numeroDocumento = safeText(student.numero_documento);

        if (!numeroDocumento || numeroDocumento === "No disponible") return;

        const extensions = ["png", "jpg", "jpeg"];

        for (let ext of extensions) {
          try {
            const imageRef = ref(
              storage,
              `estudiantes/${numeroDocumento}.${ext}`,
            );

            const url = await getDownloadURL(imageRef);
            setImageUri(url);
            return;
          } catch {}
        }

        setImageUri(null);
      } catch (error) {
        console.error("Error imagen:", error);
      }
    };

    if (student) obtenerImagenEstudiante();
  }, [student]);

  /* ============================
        SUBIR IMAGEN
  ============================ */

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];

        const resized = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );

        await uploadImage(resized.uri);
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const uploadImage = async (uri) => {
    try {
      const numeroDocumento = safeText(student?.numero_documento);

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `estudiantes/${numeroDocumento}.jpg`);

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);

      setImageUri(url);
    } catch (error) {
      console.error("Error upload:", error);
    }
  };

  /* ============================
        LOADING
  ============================ */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34531F" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Estudiante no encontrado</Text>
      </View>
    );
  }

  const carrerasOrdenadas = ordenarCarrerasPorFecha(
    student.estudiantes_carreras || [],
  );

  /* ============================
        RENDER
  ============================ */

  return (
    <ImageBackground
      source={require("../assets/fondoestudiante.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Información del Estudiante</Text>

          <ImageBackground
            source={require("../assets/fondoinicio.jpg")}
            style={styles.infoContainer}
          >
            {/* FOTO */}

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
                  <FontAwesome name="user" size={50} color="#575756" />
                  <Text style={styles.uploadText}>Subir Foto</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* PERSONALES */}

            <Text style={styles.title2}>Detalles Personales</Text>

            <View style={styles.textInfo}>
              <InfoItem
                icon="user"
                size={35}
                color="#34531F"
                label="Nombre:"
                value={capitalLetter(safeText(student.nombre_completo))}
              />

              <InfoItem
                icon="id-card"
                size={23}
                color="#34531F"
                label="Documento:"
                value={safeText(student.numero_documento)}
              />

              <InfoItem
                icon="birthday-cake"
                size={25}
                color="#34531F"
                label="Fecha de Nacimiento:"
                value={safeDate(student.fecha_nacimiento)}
              />

              <InfoItem
                icon="child"
                size={35}
                color="#34531F"
                label="Edad:"
                value={calcularEdad(student.fecha_nacimiento)}
              />

              <InfoItem
                icon="envelope"
                size={25}
                color="#34531F"
                label="Correo:"
                value={safeText(student.correo_electronico)}
              />

              <InfoItem
                icon="phone"
                size={30}
                color="#34531F"
                label="Celular:"
                value={safeText(student.celular)}
              />
            </View>

            {/* ACADÉMICOS */}

            <Text style={styles.title3}>Detalles Académicos</Text>

            {carrerasOrdenadas.map((carrera, index) => (
              <View key={index} style={styles.infoCarrera}>
                <InfoItem
                  icon="chevron-circle-right"
                  color="#6D100A"
                  label="Carrera:"
                  labelStyle={styles.labell}
                  value={justCapitalLetter(safeText(carrera?.carreras?.nombre))}
                />

                <InfoItem
                  icon="calendar"
                  color="#6D100A"
                  label="Periodo de Inicio:"
                  labelStyle={styles.labell}
                  value={safeText(
                    String(carrera?.periodos?.codigo_periodo || ""),
                  )}
                />

                <InfoItem
                  icon="map-signs"
                  color="#6D100A"
                  label="Sede:"
                  labelStyle={styles.labell}
                  value={safeText(carrera?.carreras?.sede?.nombre)}
                />

                <InfoItem
                  icon="spinner"
                  color="#6D100A"
                  label="Estado Académico:"
                  labelStyle={styles.labell}
                  value={safeText(obtenerUltimoEstadoAcademico(carrera))}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={volverNavigation}>
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

/* ============================
        STYLES
============================ */

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  scrollView: { flexGrow: 1 },

  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  title: {
    fontSize: 40,
    padding: 30,
    fontFamily: "Montserrat-Bold",
    alignSelf: "flex-start",
    color: "white",
  },

  title2: {
    fontSize: 37,
    padding: 20,
    marginTop: "-35%",
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    alignSelf: "flex-start",
  },

  title3: {
    fontSize: 37,
    padding: 20,
    fontFamily: "Montserrat-Bold",
    color: "#6D100A",
    alignSelf: "flex-start",
  },

  infoContainer: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
    borderTopRightRadius: 100,
    overflow: "hidden",
  },

  text: {
    fontSize: 18,
    fontFamily: "Montserrat-Medium",
    marginLeft: 10,
  },

  label: {
    fontFamily: "Montserrat-Bold",
    color: "#C3D730",
    fontSize: 20,
    marginLeft: 10,
  },

  labell: {
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
    fontSize: 20,
    marginLeft: 10,
  },

  textInfo: {
    alignSelf: "flex-start",
    padding: 20,
  },

  imageContainer: {
    marginLeft: "70%",
    elevation: 30,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: "white",
  },

  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },

  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 8,
    borderColor: "white",
  },

  uploadText: {
    fontFamily: "Montserrat-Medium",
    color: "#34531F",
    fontSize: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
  },

  button: {
    backgroundColor: "#6D100A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 60,
    width: 120,
    marginTop: 20,
  },

  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },

  infoItem1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "flex-start",
  },

  infoCarrera: {
    alignSelf: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
  },
});

export default StudentDetail;
