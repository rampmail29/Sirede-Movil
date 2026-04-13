import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SectionList,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { FontAwesome } from "@expo/vector-icons";
import { API_BASE_URL } from "./Config";

const ProgramasAcademicos = ({ onProgramSelect }) => {
  const [programas, setProgramas] = useState([]);
  /*  programas.forEach((a) =>
    a.data.forEach((b) => console.log("->",b.tipos_programa))
  ); */
  const [rotateAnimNaturales] = useState(new Animated.Value(0));
  const [rotateAnimSocioeconomicas] = useState(new Animated.Value(0));
  const [programaAnim] = useState(new Animated.Value(0));

  const normalizeString = (str) => {
    return (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  useEffect(() => {
    const obtenerProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/programas`);
        const data = await response.json();
        //console.log("Programas académicos obtenidos:", data);
        //data.forEach((a)=>console.log(a.facultades.nombre_facultad))
        const cleanString = (str) => str.replace(/^"|"$/g, "").trim();

        const facultadesMap = {};

        data.forEach((programa) => {
          const facultadRaw =
            programa.facultades?.nombre_facultad || "Sin facultad";
          //console.log("Programas recibidos por el BE: ",programa);
          const facultad = cleanString(facultadRaw);
          //console.log(facultad)
          if (!facultadesMap[facultad]) {
            facultadesMap[facultad] = [];
          }

          facultadesMap[facultad].push(programa);
        });
        //console.log("Facultades mapeadas:", facultadesMap);
        const grouped = Object.keys(facultadesMap).map((fac, index) => ({
          id: index,
          title: fac,
          rotateAnim: new Animated.Value(0),
          isOpen: false,
          data: facultadesMap[fac],
        }));
        //console.log("Programas agrupados por facultad:", grouped[0].data[1].nombre);
        setProgramas(grouped);
      } catch (error) {
        console.error("Error cargando programas:", error);

        showMessage({
          message: "Error",
          description: "No se pudo conectar con la base de datos.",
          type: "danger",
        });
      }
    };

    obtenerProgramas();
  }, []);

  const toggleAnimation = (isOpen, rotateAnim) => {
    Animated.spring(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const toggle = (section) => {
    const newData = programas.map((item) => {
      if (item.id === section.id) {
        toggleAnimation(!section.isOpen, item.rotateAnim);
        return { ...item, isOpen: !section.isOpen };
      }
      return item;
    });
    setProgramas(newData);
  };

  const capitalizeFirstLetter = (string) => {
    return (string || "")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const programSelect = (programa) => {
    if (onProgramSelect) {
      onProgramSelect({
        cod_snies: programa.codigo_snies,
        programa: programa.nombre,
        tipo: programa.tipos_programa?.nombre,
        id: programa.id_carrera,
      });
    }
  };

  const renderItem = ({ item, section }) => {
    if (!section.isOpen) return null;
    return (
      <View style={styles.programRow}>
        <TouchableOpacity
          style={styles.programButton}
          onPress={() => programSelect(item)}
        >
          <Text style={styles.programText}>
            {capitalizeFirstLetter(item.nombre)}
          </Text>
        </TouchableOpacity>

        {item && (
          <TouchableOpacity
            style={styles.programButton}
            onPress={() => programSelect(item)}
          >
            <Text style={styles.programText}>
              {capitalizeFirstLetter(item.nombre)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.facultadContainer}>
      <TouchableOpacity
        onPress={() => toggle(section)}
        style={styles.facultadButton}
      >
        <Text style={styles.facultadText}>
          {section.title} ({section.data.length})
        </Text>

        <Animated.View
          style={{
            transform: [
              {
                rotate: section.rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "90deg"],
                }),
              },
            ],
          }}
        >
          <FontAwesome name="caret-right" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>

      {section.isOpen && <View style={styles.programContainer} />}
    </View>
  );

  const EmptyComponent = () => (
    <Text style={styles.errorText}>
      No se encontraron programas académicos. Verifica tu conexión a internet.
    </Text>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={programas}
        keyExtractor={(item, index) => item.id_carrera.toString() + "_" + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyComponent} 
      />
    </View>
  );
};

const { height: windowHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    marginTop: -30,
  },
  facultadContainer: {
    width: "100%",
  },
  facultadButton: {
    backgroundColor: "#575756",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  facultadText: {
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  programContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  programRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  programButtonWrapper: {
    width: "49%",
    marginBottom: 5,
  },
  programButton: {
    backgroundColor: "#918c8cff",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    height: windowHeight * 0.18,
    padding: 12,
    marginBottom: 10,
  },
  programText: {
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: "Montserrat-Bold",
    color: "#34531F",
    textAlign: "center",
  },
  errorText: {
    fontSize: 20,
    color: "#6D100A",
    fontFamily: "Montserrat-Bold",
    marginTop: 20,
  },
  listContent: {
    flexGrow: 1,
  },
});
export default ProgramasAcademicos;
