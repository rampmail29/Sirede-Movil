import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "./Config";

const Estadisticas = () => {
  const navigation = useNavigation();
  const [programas, setProgramas] = useState([]);
  const [cortesIniciales, setCortesIniciales] = useState([]);
  const [cortesFinales, setCortesFinales] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState("");
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [selectedCorteInicial, setSelectedCorteInicial] = useState("");
  const [selectedCorteFinal, setSelectedCorteFinal] = useState("");
  const [modalProgramaVisible, setModalProgramaVisible] = useState(false);
  const [modalCorteInicialVisible, setModalCorteInicialVisible] =
    useState(false);
  const [modalCorteFinalVisible, setModalCorteFinalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datosBackend, setDatosBackend] = useState({});

  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const obtenerProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/programas`);
        const data = await response.json();
        //hasta acá todo ok
        ///console.log(" Programas fetched:", data);
        const filteredData = data.map((element) => ({
          cod_snies: element.codigo_snies,
          programa: element.nombre,
          tipo: element.tipos_programa?.nombre,
          id: element.id_carrera,
        }));
        setProgramas(filteredData);
      } catch (error) {
        showMessage({
          message: "Error",
          description:
            "No se pudo conectar con la base de datos. Por favor, revisa tu conexión e inténtalo de nuevo.",
          type: "danger",
          icon: "danger",
          titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" }, // Estilo del título
          textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" }, // Estilo del texto
          duration: 3000,
        });
      }
    };

    obtenerProgramas();
  }, []);

  const obtenerPeriodos = async (id_carrera) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/periodos/${id_carrera}`
      );
      const data = await response.json();
      //hasta aquí todo bien
      //console.log("Data->", data);
      if (Array.isArray(data)) {
        setCortesIniciales(data);
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description:
          "Error al obtener cortes iniciales. Por favor, revisa tu conexión e inténtalo de nuevo.",
        type: "danger",
        icon: "danger",
        position: "top",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" }, // Estilo del título
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" }, // Estilo del texto
        duration: 3000,
      });
    }
  };

  const obtenerCortesFinales = (cortes, corteInicial) => {
    return cortes.filter((corte) => corte.codigo_periodo > corteInicial);
  };

  const ProgramaSelect = (programa) => {
    //console.log("programa->: ", programa);
    setProgramaSeleccionado(programa.programa);
    setIdSeleccionado(programa.id);
    obtenerPeriodos(programa.id);
    setModalProgramaVisible(false);
  };

  const cohorteInicialSelect = (corteInicial) => {
    setSelectedCorteInicial(corteInicial);

    // Incluir el mismo periodo como opción de corte final (rango de un solo periodo)
    const cortesFiltrados = cortesIniciales.filter(
      (corte) => corte.codigo_periodo >= corteInicial
    );
    setCortesFinales(cortesFiltrados);

    // Si el corte final seleccionado es anterior al inicial, resetear
    if (selectedCorteFinal && selectedCorteFinal < corteInicial) {
      setSelectedCorteFinal("");
    }

    setModalCorteInicialVisible(false);
  };

  const cohorteFinalSelect = (corteFinal) => {
    setSelectedCorteFinal(corteFinal);
    setModalCorteFinalVisible(false);
  };

  const cancelarModal = () => {
    setModalProgramaVisible(false);
    setModalCorteInicialVisible(false);
    setModalCorteFinalVisible(false);
  };

  const evaluarClick = async () => {
    if (!programaSeleccionado || !selectedCorteInicial) {
      showMessage({
        message: "Error",
        description: "Por favor seleccione todos los datos necesarios",
        duration: 3000,
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 16, fontFamily: "Montserrat-Regular" },
        type: "danger",
        icon: "danger",
        position: "top",
      });
      return;
    }
    if (selectedCorteFinal && selectedCorteFinal < selectedCorteInicial) {
      showMessage({
        message: "Error",
        description: "El periodo final debe ser igual o mayor al periodo inicial.",
        type: "danger",
        icon: "danger",
        duration: 3000,
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 16, fontFamily: "Montserrat-Regular" },
        position: "top",
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/estudiantes-por-matricula`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idCarrera: idSeleccionado,
            periodoInicial: selectedCorteInicial,
            periodoFinal: selectedCorteFinal || selectedCorteInicial,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!data.resumenPorPeriodo || Object.keys(data.resumenPorPeriodo).length === 0) {
        setLoading(false);
        showMessage({
          message: "Sin datos",
          description: "No se encontraron registros para el rango seleccionado.",
          type: "warning",
          icon: "warning",
          position: "top",
          duration: 4000,
        });
        return;
      }

      setDatosBackend(data.resumenPorPeriodo);
    } catch (error) {
      clearTimeout(timeoutId);
      setLoading(false);
      const esTimeout = error.name === "AbortError";
      showMessage({
        message: esTimeout ? "Tiempo de espera agotado" : "Error de conexión",
        description: esTimeout
          ? "El servidor tardó demasiado en responder. Verifica tu conexión e inténtalo de nuevo."
          : "No se pudo obtener los datos. Revisa tu conexión e inténtalo de nuevo.",
        type: "danger",
        icon: "danger",
        position: "top",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const tieneDatos = datosBackend && Object.keys(datosBackend).length > 0;

    if (tieneDatos) {
      const timeout = setTimeout(() => {
        setLoading(false);
        navigation.navigate("GraficarMatriculas", {
          fromScreen: "Estadis_Matricula",
          selectedCorteInicial,
          selectedCorteFinal: selectedCorteFinal || selectedCorteInicial,
          programaSeleccionado,
          idSeleccionado,
          datosBackend,
        });
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [datosBackend]);

  return (
    <ImageBackground
      source={require("../assets/fondoinicio.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Estadísticas por matriculas</Text>
        <Text style={styles.subtitle}>
          Seleccione el programa académico y el rango de matricula:
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalProgramaVisible(true)}
        >
          <Text style={styles.buttonText}>
            {programaSeleccionado
              ? `${capitalizeFirstLetter(programaSeleccionado)}`
              : "Seleccionar Programa"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonCorte}
          onPress={() => setModalCorteInicialVisible(true)}
        >
          <Text style={styles.buttonTextCortes}>
            {selectedCorteInicial
              ? `Periodo inicial: ${selectedCorteInicial}`
              : "Seleccionar Periodo Matricula"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonCorte}
          onPress={() => setModalCorteFinalVisible(true)}
        >
          <Text style={styles.buttonTextCortes}>
            {selectedCorteFinal
              ? `Periodo final: ${selectedCorteFinal}`
              : "Seleccionar Periodo Matricula"}
          </Text>
        </TouchableOpacity>

        {/* Modal para seleccionar el Programa academico */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalProgramaVisible}
          onRequestClose={() => setModalProgramaVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccione un programa</Text>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {programas.map((programa, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() => ProgramaSelect(programa)}
                  >
                    <Text style={styles.modalItemText}>
                      {capitalizeFirstLetter(programa.programa)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Botón de cancelar */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal para seleccionar Cohorte Inicial */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCorteInicialVisible}
          onRequestClose={() => setModalCorteInicialVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Seleccione un periodo de matricula
              </Text>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {cortesIniciales.map((corte, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() => cohorteInicialSelect(corte.codigo_periodo)}
                  >
                    <Text style={styles.modalItemTextCorte}>
                      {corte.codigo_periodo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal para seleccionar Cohorte FINAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCorteFinalVisible}
          onRequestClose={() => setModalCorteFinalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Seleccione un periodo de matricula
              </Text>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {cortesFinales.map((corte, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() => cohorteFinalSelect(corte.codigo_periodo)}
                  >
                    <Text style={styles.modalItemTextCorte}>
                      {corte.codigo_periodo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal para mostrar la pantalla de carga */}
        <Modal animationType="fade" transparent={true} visible={loading}>
          <View style={styles.modalContainer}>
            {loading && (
              <View>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            )}
          </View>
        </Modal>

        {/* Botón para evaluar */}
        <TouchableOpacity style={styles.evaluarButton} onPress={evaluarClick}>
          <Text style={styles.buttonText}>Evaluar</Text>
        </TouchableOpacity>
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
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: "Montserrat-Bold",
    alignSelf: "flex-start",
    marginBottom: 20,
    color: "#C3D730",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Medium",
    alignSelf: "flex-start",
    color: "#132F20",
    marginBottom: 50,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#34531F",
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonCorte: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8E9D4",
    marginBottom: 10,
    borderRadius: 8,
  },
  evaluarButton: {
    width: "60%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6D100A",
    marginTop: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#F8E9D4",
    textAlign: "center",
  },
  buttonTextCortes: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    textAlign: "center",
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#34531F",
  },
  modalItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#666",
  },
  modalItemTextCorte: {
    fontSize: 30,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#666",
  },
  cancelButton: {
    marginTop: 50,
    backgroundColor: "#f44336", // Color de fondo rojo, puedes cambiarlo según tu preferencia
    paddingVertical: 10,
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
    borderRadius: 8,
    width: 150, // Ancho del botón, ajusta según tu diseño
    alignSelf: "center", // Centra el botón horizontalmente
  },
  cancelButtonText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#fff", // Color del texto blanco, puedes cambiarlo según tu preferencia
  },
  resultadosContainer: {
    marginVertical: 10,
  },
  resultadosText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#34531F",
  },
  analisisText: {
    padding: 20,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#575756",
  },

  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});

export default Estadisticas;
