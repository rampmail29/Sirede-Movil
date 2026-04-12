import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from "victory-native";

import { API_BASE_URL } from "./Config";
import { useNavigation } from "@react-navigation/native";

const coloresEstados = {
  ACTIVO: "#2ecc71",
  DESERTADO: "#e74c3c",
  GRADUADO: "#3498db",
  CANCELADO: "#f39c12",
  INACTIVO: "#7f8c8d",
};

const obtenerColorEstado = (estado) => {
  if (coloresEstados[estado]) {
    return coloresEstados[estado];
  }

  const paleta = [
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#16a085",
    "#c0392b",
    "#2980b9",
  ];

  const index = estado.length % paleta.length;

  return paleta[index];
};

const GraficarMatriculas = ({ route }) => {
  const {
    fromScreen,
    selectedCorteInicial,
    selectedCorteFinal,
    programaSeleccionado,
    idSeleccionado,
    datosBackend,
  } = route.params;

  const navigation = useNavigation();

  const [datosEstados, setDatosEstados] = useState([]);

  const fetchEjecutado = useRef(false);

  /* ------------------------------ */
  /* UTILIDADES */
  /* ------------------------------ */

  const capitalizeFirstLetter = (string) => {
    return string
      ?.toLowerCase()
      ?.split(" ")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ");
  };

  function obtenerSegundoPeriodoAnterior(periodo) {
    const [anio, semestre] = periodo.split("-");

    let anioAnterior = parseInt(anio);
    let semestreAnterior = parseInt(semestre);

    semestreAnterior -= 2;

    if (semestreAnterior <= 0) {
      semestreAnterior += 2;
      anioAnterior -= 1;
    }

    return `${anioAnterior}-${semestreAnterior}`;
  }

  /* ------------------------------ */
  /* EXTRAER PERIODOS DESDE DESERCIÓN */
  /* ------------------------------ */

  const dataDesercion = useMemo(() => {
    if (!datosBackend?.resumenPorPeriodo) return [];

    const data = [];

    Object.keys(datosBackend.resumenPorPeriodo).forEach((periodo) => {
      const desertores = datosBackend.resumenPorPeriodo[periodo]?.Desertores;

      data.push({
        periodo,
        desertores,
      });
    });

    return data;
  }, [datosBackend]);

  const periodosFinales = useMemo(() => {
    return dataDesercion.map((item) => ({
      periodo: item.periodo,
      desertores: item.desertores,
      segundoPeriodoAnterior: obtenerSegundoPeriodoAnterior(item.periodo),
    }));
  }, [dataDesercion]);

  /* ------------------------------ */
  /* CONSULTAR ESTADOS AL BACKEND */
  /* ------------------------------ */

  useEffect(() => {
    if (!periodosFinales.length) return;
    if (fetchEjecutado.current) return;

    fetchEjecutado.current = true;

    const obtenerEstados = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/matriculados-por-periodos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idSeleccionado,
              periodosFinales,
            }),
          },
        );

        const data = await response.json();

        setDatosEstados(data);
      } catch (error) {
        console.error("Error obteniendo estados", error);
      }
    };

    obtenerEstados();
  }, [periodosFinales]);

  /* ------------------------------ */
  /* DETECTAR ESTADOS EXISTENTES */
  /* ------------------------------ */

  const estadosDisponibles = useMemo(() => {
    const setEstados = new Set();

    datosEstados.forEach((item) => {
      Object.keys(item.estados || {}).forEach((estado) => {
        setEstados.add(estado);
      });
    });

    return Array.from(setEstados);
  }, [datosEstados]);

  /* ------------------------------ */
  /* GENERAR DATASETS */
  /* ------------------------------ */

  const datasets = useMemo(() => {
    const data = {};

    estadosDisponibles.forEach((estado) => {
      data[estado] = datosEstados.map((item) => ({
        periodo: item.periodo,
        valor: item.estados?.[estado] || 0,
      }));
    });

    return data;
  }, [datosEstados, estadosDisponibles]);

  /* ------------------------------ */
  /* RENDER */
  /* ------------------------------ */

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground
        source={require("../assets/fondoinicio.jpg")}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Resultados del análisis</Text>

          <Text style={styles.subtitle}>
            Este
            <Text style={{ fontFamily: "Montserrat-Bold" }}>
              {" "}
              análisis estadístico{" "}
            </Text>
            se enfoca en la comparación de las frecuencias del estado académico
            del estudiante en la carrera de
            <Text style={{ fontFamily: "Montserrat-Bold" }}>
              {" "}
              {capitalizeFirstLetter(programaSeleccionado)}
            </Text>
            . Los datos aquí presentados permiten visualizar el progreso y las
            transiciones de los estudiantes a lo largo del tiempo, desde el
            <Text style={{ fontFamily: "Montserrat-Bold" }}>
              {" "}
              {selectedCorteInicial}
            </Text>{" "}
            hasta el
            <Text style={{ fontFamily: "Montserrat-Bold" }}>
              {" "}
              {selectedCorteFinal}
            </Text>
            .
          </Text>

          {estadosDisponibles.map((estado) => (
            <View key={estado} style={styles.chartContainer}>
              <Text style={styles.chartTitleR}>
                Histograma de {capitalizeFirstLetter(estado)}
              </Text>

              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={60}
                padding={{ top: 40, bottom: 120, left: 60, right: 40 }}
              >
                <VictoryAxis
                  tickFormat={(t) => t}
                  tickLabelComponent={
                    <VictoryLabel
                      angle={-90}
                      textAnchor="end"
                      verticalAnchor="middle"
                      dy={10}
                    />
                  }
                />

                <VictoryAxis dependentAxis />

                <VictoryBar
                  data={datasets[estado]}
                  x="periodo"
                  y="valor"
                  cornerRadius={{ topLeft: 15 }}
                  labels={({ datum }) => datum.valor}
                  labelComponent={<VictoryLabel dy={30} />}
                  animate={{ duration: 500 }}
                  style={{
                    data: {
                      fill: obtenerColorEstado(estado),
                    },
                  }}
                />
              </VictoryChart>
            </View>
          ))}

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(fromScreen)}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 30,
    width: "100%",
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
    textAlign: "justify",
    color: "#132F20",
    marginBottom: 10,
  },
  chartTitleD: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#a81b11",
    marginTop: 20,
    marginBottom: -25,
  },
  chartTitleG: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    marginTop: 20,
    marginBottom: -25,
  },
  chartTitleR: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
    marginTop: 20,
    marginBottom: -25,
  },
  chartTitleI: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
    marginTop: 20,
    marginBottom: -25,
  },
  chartContainer: {
    // Nuevo estilo para el contenedor del gráfico
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#6D100A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 80,
    width: 120,
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  statisticalText: {
    fontSize: 20,
    fontFamily: "Montserrat-Medium",
    color: "#132F20",
    textAlign: "justify",
    marginBottom: 20,
  },
});
export default GraficarMatriculas;
