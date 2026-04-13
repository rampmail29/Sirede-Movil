import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "./Config";

const CortesAcademicos = ({ selectedProgram, onNext }) => {
  const navigation = useNavigation();
  const [cortesIniciales, setCortesIniciales] = useState([]);
  const [corteFinal, setCorteFinal] = useState([]);
  const [selectedCorteInicial, setSelectedCorteInicial] = useState("");
  const [modalCorteInicialVisible, setModalCorteInicialVisible] =
    useState(false);
  const [datosBackend, setDatosBackend] = useState(null);
  const [loading, setLoading] = useState(false);
  //console.log(selectedProgram);
  // Obtener los cortes iniciales basados en el ID del programa
  const obtenerCortesIniciales = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cortes-iniciales/${selectedProgram.id}`
      );
      const data = await response.json();
      //console.log("data", data);
      Array.isArray(data) && setCortesIniciales(data.map(c => c.codigo_periodo));
    } catch (error) {
      showMessage({
        message: "Error",
        description:
          "Error al obtener cohortes iniciales. Revisa tu conexión e inténtalo de nuevo.",
        type: "danger",
        icon: "danger",
        position: "top",
        titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
        textStyle: { fontSize: 18, fontFamily: "Montserrat-Regular" },
        duration: 3000,
      });
    }
  };

  // Generar cortes finales (cohortes) basados en el año y periodo inicial
  const generarCohorte = (anio, periodo, cantidadSemestres) => {
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

  // Lógica para calcular el corte tope (corte final) basado en el corte inicial y el tipo de programa
  useEffect(() => {
    const cohorteTope = () => {
      if (
        !selectedCorteInicial ||
        typeof selectedCorteInicial !== "string" ||
        !selectedProgram
      ) {
        return;
      }
      //console.log("programa seleccionado: ", selectedProgram);
      // Convertir tipo a string de forma segura
      const tipoPrograma = String(selectedProgram.tipo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      //console.log("🚀 ~ cohorteTope ~ tipoPrograma:", tipoPrograma)

      // Obtener año y periodo del corte inicial
      const [anioInicial, periodoInicial] = selectedCorteInicial
        .split("-")
        .map(Number);

      // Determinar semestres
      let cantidadSemestres = 0;
      if (tipoPrograma === "profesional") {
        cantidadSemestres = 4;
      } else if (tipoPrograma === "tecnologico" || tipoPrograma === "tecnologia") {
        cantidadSemestres = 6;
      } else {
        console.error("Tipo de programa no válido:", selectedProgram.tipo);
        return;
      }

      // Generar los cortes finales
      const cortesFinalesCalculados = generarCohorte(
        anioInicial,
        periodoInicial,
        cantidadSemestres
      );

      // Agregar cortes iniciales posteriores
      cortesIniciales.forEach((corte) => {
        if (corte > selectedCorteInicial) {
          cortesFinalesCalculados.push({ label: corte, key: corte });
        }
      });

      // Tomar solo el último
      const ultimoCorteFinal =
        cortesFinalesCalculados.slice(-1)[0]?.key || null;

      setCorteFinal(ultimoCorteFinal);
    };

    cohorteTope();
  }, [selectedCorteInicial, selectedProgram, cortesIniciales]);

  // UseEffect separado para imprimir el valor actualizado de corteFinal
  useEffect(() => {
    if (corteFinal) {
      //console.log("Cohorte Final:", corteFinal);
    }
  }, [corteFinal]);

  // Ejecutar cuando el programa seleccionado cambie
  useEffect(() => {
    if (!selectedProgram?.id) return;
    obtenerCortesIniciales();
  }, [selectedProgram]);

  // Seleccionar corte inicial
  const corteInicialSelect = (corteInicial) => {
    setSelectedCorteInicial(corteInicial);
    setModalCorteInicialVisible(false);
  };

  const cancelarModal = () => {
    setModalCorteInicialVisible(false);
  };

  const capitalizeFirstLetter = (string) => {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const evaluarClick = async () => {
    try {
      if (!selectedProgram || !selectedCorteInicial) {
        showMessage({
          message: "Error",
          description: "Por favor seleccione todos los datos necesarios",
          duration: 2500,
          titleStyle: { fontSize: 18, fontFamily: "Montserrat-Bold" },
          textStyle: { fontSize: 16, fontFamily: "Montserrat-Regular" },
          type: "danger",
          icon: "danger",
        });
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/estadisticasPdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_carrera: selectedProgram.id,
            corteInicial: selectedCorteInicial,
            corteFinal,
          }),
        }
      );
      
      const data = await response.json();
      //console.log("Datos recibidos del backend:", data);
      setDatosBackend(data);
      data.carrera = selectedProgram;

      if (typeof onNext === "function") {
        onNext({
          data,
          selectedCorteInicial,
          corteFinal,
        });
      } else {
        console.warn("onNext no está definida como una función.");
      }
    } catch (error) {
      console.error("Error al obtener datos del backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datosBackend?.todos?.length > 0) {
      const timeout = setTimeout(() => {}, 1000);
      return () => clearTimeout(timeout);
    }
  }, [datosBackend, onNext]);

  return (
    <View style={styles.container}>
      {selectedProgram && (
        <Text style={styles.title}>
          {capitalizeFirstLetter(selectedProgram.programa)}
        </Text>
      )}

      <TouchableOpacity
        style={styles.buttonCorte}
        onPress={() => setModalCorteInicialVisible(true)}
      >
        <Text style={styles.buttonTextCortes}>
          {selectedCorteInicial
            ? `Cohorte inicial: ${selectedCorteInicial}`
            : "Seleccionar Cohorte Inicial"}
        </Text>
      </TouchableOpacity>

      {/* Modal para seleccionar Cohorte Inicial */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCorteInicialVisible}
        onRequestClose={() => setModalCorteInicialVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione un cohorte</Text>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {cortesIniciales.map((corte, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItemContainer}
                  onPress={() => corteInicialSelect(corte)}
                >
                  <Text style={styles.modalItemTextCorte}>
                    {corte}
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
              <ActivityIndicator size="large" color="#fff" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: -0,
  },
  title: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginTop: -30,
    marginBottom: 20,
    textAlign: "center",
    color: "#34531F",
  },
  buttonCorte: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#575756",
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonTextCortes: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#Fff",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
  modalItemTextCorte: {
    fontSize: 30,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: "#666",
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "#f44336",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    width: 150,
    alignSelf: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  evaluarButton: {
    width: "60%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B3B3B3",
    marginTop: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    textAlign: "center",
  },
});

export default CortesAcademicos;
