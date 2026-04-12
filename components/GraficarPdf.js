import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { generatePDF } from "./Generate";

const GraficarPdf = ({ route, navigation }) => {
  const { tipoInforme, datos, programa, corteInicial, corteFinal } =
    route.params;

  const dataArray = datos[tipoInforme] || []; // Evitar undefined si no hay datos
  //console.log("🚀 ~ GraficarPdf ~ dataArray:", dataArray)

  const [imageUrls, setImageUrls] = useState({});
  const [showModal, setShowModal] = useState(false);
  const fetchImages = async () => {
    const extensions = ["png", "jpg", "jpeg"];

    for (let student of dataArray) {
      const documento = student.numero_documento;
      for (let ext of extensions) {
        try {
          const imageRef = ref(storage, `estudiantes/${documento}.${ext}`);
          const url = await getDownloadURL(imageRef);
          setImageUrls((prevUrls) => ({
            ...prevUrls,
            [documento]: url,
          }));
          break;
        } catch (error) {}
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [dataArray]),
  );

  const capitalizeFirstLetter = (string = "") => {
    if (!string) return "";
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const scale = useSharedValue(1);
  const animationDuration = 800;
  const scaleFactor = 1.05;

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(scaleFactor, { duration: animationDuration }),
        withTiming(1, { duration: animationDuration }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleGeneratePDF = () => {
    if (dataArray.length === 0) {
      setShowModal(true);
    } else {
      generatePDF(dataArray, programa, tipoInforme, corteInicial, corteFinal);
    }
  };
  const capitalLetter = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .trim()
      .split(/\s+/)
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <ImageBackground
      source={require("../assets/fondoinformes.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.container2}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("InformeCarrera")}
          >
            <FontAwesome name="arrow-left" size={24} color="#6D100A" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {(tipoInforme || "").toLowerCase() === "general"
              ? `Informe de Estudiantes`
              : `Informe de ${capitalizeFirstLetter(tipoInforme)}`}
          </Text>

          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={styles.buttonPdf}
              onPress={handleGeneratePDF}
            >
              <Text style={styles.textButtonPdf}>Generar Informe en PDF</Text>
              <FontAwesome
                name="file-pdf-o"
                size={22}
                color="#F8E9D4"
                style={styles.pdfIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.datosContainer}>
            {dataArray && dataArray.length > 0 ? (
              dataArray.map((dato, index) => (
                <View key={index} style={styles.datoContainer}>
                  <View style={styles.infoContainer}>
                    <View style={styles.imageContainer}>
                      {imageUrls[dato.numero_documento] ? (
                        <Image
                          source={{ uri: imageUrls[dato.numero_documento] }}
                          style={styles.image}
                        />
                      ) : (
                        <FontAwesome name="user" size={40} color="#575756" />
                      )}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.datoNombre}>
                        {capitalizeFirstLetter(dato.nombre_completo)}{" "}
                      </Text>
                      <Text style={styles.datoDocumento}>
                        Nombre:{" "}
                        {capitalLetter(dato.estudiantes.nombre_completo)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.infoIcon}
                      onPress={() =>
                        navigation.navigate("StudentDetail", {
                          id: dato.estudiantes.id_estudiante,
                          fromScreen: "GraficarPdf",
                          tipoInforme: tipoInforme,
                          datos: datos,
                        })
                      }
                    >
                      <FontAwesome
                        name="info-circle"
                        size={30}
                        color="#6D100A"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessage}>
                No hay estudiantes {tipoInforme} en los cortes seleccionados,
                intente en otro rango.
              </Text>
            )}
          </View>
        </ScrollView>

        <Modal
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                No se puede generar un informe en PDF pues no existen
                estudiantes {tipoInforme} para ese rango de años seleccionados.
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  container2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8E9D4",
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50,
    elevation: 5,
  },
  title: {
    fontSize: 40,
    color: "#6D100A",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  scrollViewContent: {
    paddingTop: 240,
    paddingBottom: 110,
  },
  datosContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  datoContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    opacity: 0.9,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
  },
  datoNombre: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#333",
  },
  datoDocumento: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#333",
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "white",
  },
  infoIcon: {
    marginLeft: "auto",
    marginRight: 10,
  },
  buttonPdf: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6D100A",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textButtonPdf: {
    color: "#F8E9D4",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginRight: 10,
  },
  pdfIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#6D100A",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
  },
});

export default GraficarPdf;
