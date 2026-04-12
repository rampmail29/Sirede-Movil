import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";

const OpcionesInforme = ({
  academicData,
  selectedCorteInicial,
  selectedCorteFinal,
}) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  /** ============================================
   *           Navegación genérica
   * ============================================ */
  const navigationInforme = (tipoInforme, datos) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      navigation.navigate("GraficarPdf", {
        tipoInforme,
        datos,
        programa: academicData?.carrera ?? "N/D",
        corteInicial: selectedCorteInicial ?? "N/D",
        corteFinal: selectedCorteFinal ?? "N/D",
      });
    }, 800);
  };

  /** ============================================
   *          Mensaje genérico de error
   * ============================================ */
  const mostrarError = (nombre) => {
    showMessage({
      message: "Error",
      description: `No se puede generar el informe de ${nombre} porque no hay datos suficientes. Seleccione programa y cortes y presione Evaluar.`,
      duration: 4000,
      titleStyle: { fontSize: 19, fontFamily: "Montserrat-Bold" },
      textStyle: {
        fontSize: 18,
        fontFamily: "Montserrat-Regular",
        textAlign: "justify",
      },
      type: "danger",
      icon: "danger",
    });
  };

  /** ============================================
   *       Función genérica para informes
   * ============================================ */
  const generarInforme = (tipo, arreglo, nombreError) => {
    if (!selectedCorteInicial || !selectedCorteFinal) {
      return mostrarError("cortes académicos");
    }

    if (!academicData || !arreglo || arreglo.length === 0) {
      return mostrarError(nombreError);
    }

    navigationInforme(tipo, { [tipo]: arreglo });
  };

  /** ============================================
   *    Obtener último estado académico
   * ============================================ */
  const obtenerUltimoEstado = (historico) => {
    if (!historico || historico.length === 0) return null;

    const ultimo = historico[historico.length - 1];

    return (
      ultimo
        ?.estados_academicos_historico_estado_estado_nuevo_idToestados_academicos
        ?.nombre_estado ?? null
    );
  };

  /** ============================================
   *    Filtrar estudiantes por estado
   * ============================================ */
  const filtrarPorEstado = (estadoBuscado) => {
    return (
      academicData?.todosEstudiantes?.filter((est) => {
        const estado = obtenerUltimoEstado(est.historico_estado);
        //console.log("🚀 ~ filtrarPorEstado ~ estado:", estado)
        return estado === estadoBuscado;
      }) ?? []
    );
  };
  /** ============================================
   *   CONFIGURACIÓN DINÁMICA DE INFORMES
   * ============================================ */
  const informesConfig = [
    {
      tipo: "general",
      label: "Todos los Estudiantes",
      icon: "users",
      obtenerDatos: () => academicData?.todosEstudiantes ?? [],
      error: "estudiantes",
    },

    {
      tipo: "graduados",
      label: "Graduados",
      icon: "user-graduate",
      estado: "GRADUADO",
    },

    {
      tipo: "retenidos",
      label: "Retenidos",
      icon: "user-clock",
      estado: "RETENIDO",
    },

    {
      tipo: "desertados",
      label: "Desertados",
      icon: "user-times",
      estado: "DESERTOR",
    },

    {
      tipo: "inactivos",
      label: "Inactivos",
      icon: "user-slash",
      estado: "INACTIVO",
    },

    {
      tipo: "activos",
      label: "Activos",
      icon: "user-check",
      estado: "ACTIVO",
    },

    {
      tipo: "pfi",
      label: "PFI",
      icon: "exclamation-circle",
      estado: "PFI",
    },

    {
      tipo: "condicional",
      label: "Condicional",
      icon: "balance-scale",
      estado: "CONDICIONAL",
    },

    {
      tipo: "sobresaliente",
      label: "Sobresaliente",
      icon: "star",
      estado: "SOBRESALIENTE",
    },

    {
      tipo: "excluido_cancelacion_semestre",
      label: "Cancelación Semestre",
      icon: "ban",
      estado: "EXCLUIDO CANCELACION SEMESTRE",
    },

    {
      tipo: "excluido_no_renovacion_matricula",
      label: "No Renovación",
      icon: "calendar-times",
      estado: "EXCLUIDO NO RENOVACION DE MATRICULA",
    },

    {
      tipo: "excluido_permanente",
      label: "Exclusión Permanente",
      icon: "user-lock",
      estado: "EXCLUIDO PERMANENTE",
    },

    {
      tipo: "excluido_transferencia_interna",
      label: "Transferencia Interna",
      icon: "exchange-alt",
      estado: "EXCLUIDO TRANSFERENCIA INTERNA",
    },
  ];

  /** ============================================
   *        GENERAR INFORME DESDE CONFIG
   * ============================================ */
  const ejecutarInforme = (config) => {
    const datos = config.obtenerDatos
      ? config.obtenerDatos()
      : filtrarPorEstado(config.estado);

    generarInforme(config.tipo, datos, config.label);
  };

  /** ============================================
   *    Renderizar botones en filas de 2
   * ============================================ */
  const filas = [];
  for (let i = 0; i < informesConfig.length; i += 2) {
    filas.push(informesConfig.slice(i, i + 2));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34531F" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        filas.map((fila, index) => (
          <View style={styles.row} key={index}>
            {fila.map((config) => (
              <TouchableOpacity
                key={config.tipo}
                style={styles.button}
                onPress={() => ejecutarInforme(config)}
              >
                <FontAwesome5
                  name={config.icon}
                  size={40}
                  color="white"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>{config.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 6,
    width: "100%",
  },

  button: {
    width: 150,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#575756",
    borderRadius: 8,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderColor: "#878787",
    borderWidth: 5,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },

  icon: {
    marginBottom: 10,
  },

  buttonText: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "white",
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
});

export default OpcionesInforme;
