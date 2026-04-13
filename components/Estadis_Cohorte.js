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
  const [corteFinal, setCorteFinal] = useState("");
  const [programaSeleccionado, setProgramaSeleccionado] = useState("");
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [tipoProgramaSeleccionado, setTipoProgramaSeleccionado] = useState("");
  const [selectedCorteInicial, setSelectedCorteInicial] = useState(null);
  const [modalProgramaVisible, setModalProgramaVisible] = useState(false);
  const [modalCorteInicialVisible, setModalCorteInicialVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [datosBackend, setDatosBackend] = useState({
    todosEstudiantes: [],
    graduados: [],
    retenidos: [],
    desertados: [],
    activos: [],
    inactivos: [],
  });

  const capitalizeFirstLetter = (string) => {
    //console.log(string)
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
        //console.log("Data estadis_cohorte: ", data);
        const filteredData = data.map((element) => ({
          cod_snies: element.codigo_snies,
          programa: element.nombre,
          tipo: element.tipos_programa?.nombre,
          id: element.id_carrera,
        }));
        //console.log(filteredData);
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

  const obtenerCortesIniciales = async (id_carrera) => {
    //console.log("Obteniendo cortes iniciales para carrera ID:", id_carrera);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cortes-iniciales/${id_carrera}`,
      );
      const data = await response.json();
      //console.log("🚀 ~ obtenerCortesIniciales ~ data:", data);
      //hasta aquí ok, se pobla el sect con los cortes;
      //console.log("cohortes iniciales: ", data);
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

  useEffect(() => {
    const cohorteTope = () => {
      //console.log("Calculando corte final para:", { selectedCorteInicial });
      if (!selectedCorteInicial?.valor) return;
      if (!programaSeleccionado?.semestres_totales) return;
      const [anioInicial, periodoInicial] = selectedCorteInicial.valor
        .split("-")
        .map(Number);
      // Obtener año y periodo del corte inicial
      // Obtener cantidad de periodos reales del programa (1 periodo por semestre)
      const cantidadSemestres = programaSeleccionado.semestres_totales;

      // Generar los cortes finales según cantidad de semestres
      const cortesFinalesCalculados = generarcohorte(
        anioInicial,
        periodoInicial,
        cantidadSemestres,
      );

      // Agregar cortes iniciales posteriores al corte inicial
      cortesIniciales
        .filter((c) => c.codigo_periodo > selectedCorteInicial.valor)
        .forEach((c) => {
          cortesFinalesCalculados.push({ label: c.codigo_periodo, key: c.codigo_periodo });
        });

      // Tomar solo el último corte final
      const ultimoCorteFinal =
        cortesFinalesCalculados.slice(-1)[0]?.key || null;

      //console.log("Corte final calculado:", ultimoCorteFinal);

      setCorteFinal(ultimoCorteFinal);
    };

    cohorteTope();
  }, [selectedCorteInicial, programaSeleccionado, cortesIniciales]);

  // Función para generar cortes finales
  const generarcohorte = (anio, periodo, cantidadSemestres) => {
    const cortes = [];
    let anioActual = anio;
    let periodoActual = periodo;

    for (let i = 0; i < cantidadSemestres; i++) {
      cortes.push({
        label: `${anioActual}-${periodoActual}`,
        key: `${anioActual}-${periodoActual}`,
      });

      if (periodoActual === 1) {
        periodoActual = 2;
      } else {
        periodoActual = 1;
        anioActual += 1;
      }
    }

    return cortes;
  };

const ProgramaSelect = (programa) => {
  setProgramaSeleccionado(programa); // guardar objeto completo
  setTipoProgramaSeleccionado(programa.tipo);
  setIdSeleccionado(programa.id);
  obtenerCortesIniciales(programa.id);
  setModalProgramaVisible(false);
};

  const cohorteInicialSelect = (corte) => {
    setSelectedCorteInicial(corte);
    setModalCorteInicialVisible(false);
  };

  const cancelarModal = () => {
    setModalProgramaVisible(false);
    setModalCorteInicialVisible(false);
  };

  const evaluarClick = async () => {
    try {
      /* Hasta aquí OK --> console.log("Evaluar click con:", {
        programaSeleccionado,
        selectedCorteInicial
      }); */
      if (!programaSeleccionado || !selectedCorteInicial) {
        showMessage({
          message: "Error",
          description: "Por favor seleccione todos los datos necesarios",
          duration: 3000,
          titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" }, // Estilo del título
          textStyle: { fontSize: 16, fontFamily: "Montserrat-Regular" }, // Estilo del texto
          type: "danger",
          icon: "danger",
          position: "top",
        });
        return;
      }
      setLoading(true);
      setDatosBackend({});
      //console.log("programaSeleccionado.id: ", programaSeleccionado);
      const response = await fetch(
        `${API_BASE_URL}/api/estudiantes-por-corte`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            /* idCarrera: idSeleccionado,
            periodoInicial: selectedCorteInicial, */
            idCarrera: programaSeleccionado.id,
            codigo_periodo: selectedCorteInicial.valor,
          }),
        },
      );
      setLoading(false);

      const data = await response.json();
      //console.log("Datos recibidos del backend en estadis_cohorte:", data);
      setDatosBackend(data);
      setLoading(true);
    } catch (error) {
      console.error("Error al obtener datos del backend:", error);
    }
  };

  useEffect(() => {
    if ((datosBackend?.totalMatriculados ?? 0) > 0) {
      //console.log("Datos recibidos:", datosBackend);
      const timeout = setTimeout(() => {
        setLoading(false);

        navigation.navigate("GraficarCohorte", {
          fromScreen: "Estadis_Cohorte",
          selectedCorteInicial,
          ultimoCorteFinal: corteFinal,
          programaSeleccionado,
          tipoProgramaSeleccionado,
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
        <Text style={styles.title}>Estadísticas de Cohorte inicial</Text>
        <Text style={styles.subtitle}>
          Seleccione el programa académico y el periodo de inicio:
        </Text>

        {/* Selección de programa */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalProgramaVisible(true)}
        >
          <Text style={styles.buttonText}>
            {programaSeleccionado
              ? capitalizeFirstLetter(programaSeleccionado.programa)
              : "Seleccionar Programa"}
          </Text>
        </TouchableOpacity>

        {/* Selección de cohorte inicial */}
        <TouchableOpacity
          style={styles.buttonCorte}
          onPress={() => setModalCorteInicialVisible(true)}
        >
          <Text style={styles.buttonTextCortes}>
            {selectedCorteInicial
              ? `Corte inicial: ${selectedCorteInicial.valor}`
              : "Seleccionar Cohorte Inicial"}
          </Text>
        </TouchableOpacity>

        {/* Modal Programas */}
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

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Cohorte Inicial */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCorteInicialVisible}
          onRequestClose={() => setModalCorteInicialVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Seleccione un periodo inicial
              </Text>

              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {cortesIniciales.map((corte, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItemContainer}
                    onPress={() =>
                      cohorteInicialSelect({
                        id: corte.id_periodo,
                        valor: corte.codigo_periodo,
                      })
                    }
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

        {/* Modal carga */}
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

        {/* Botón Evaluar */}
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
