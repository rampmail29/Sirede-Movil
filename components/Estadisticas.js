import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import  AnimatedButton  from "./AnimatedButton"

const Informes = () => {
  const navigation = useNavigation();

  const cohortePress = () => {
    navigation.navigate("Estadis_Cohorte");
  };

  const matriculaPress = () => {
    navigation.navigate("Estadis_Matricula");
  };

  return (
    <ImageBackground
      source={require("../assets/fondoinicio.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Estadísticas</Text>

          <Text style={styles.subtitle}>
            Por favor, seleccione el tipo de consulta del estado académico de
            los estudiantes por cohorte o rango de matrícula:
          </Text>

          <AnimatedButton style={styles.button} onPress={cohortePress}>
            <FontAwesome name="sign-in" size={30} color="#C3D730" />
            <Text style={styles.buttonText}>
              Estado Académico por Cohorte de Inicio de Carrera.
            </Text>
          </AnimatedButton>

          <AnimatedButton style={styles.button} onPress={matriculaPress}>
            <FontAwesome name="calendar" size={30} color="#C3D730" />
            <Text style={styles.buttonText}>
              Estado Académico por Rango de Matrículas.
            </Text>
          </AnimatedButton>
        </View>
      </ScrollView>
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
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
    alignSelf: "flex-start",
    color: "#132F20",
    marginBottom: 50,
    textAlign: "justify",
  },
  button: {
    backgroundColor: "#F0FFF2",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20,
    borderWidth: 3, // Ancho del borde
    borderColor: "#34531F", // Color del borde
    justifyContent: "center",
  },
  buttonText: {
    color: "#132F20",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});

export default Informes;
