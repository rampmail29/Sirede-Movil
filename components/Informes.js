import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Informes = () => {
  const navigation = useNavigation();

  const estudiantesPress = () => {
    navigation.navigate("InformeEstudiante");
  };

  const programasPress = () => {
    navigation.navigate("InformeCarrera");
  };

  return (
    <ImageBackground
      source={require("../assets/fondoinicio.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Informes</Text>

          <Text style={styles.subtitle}>
            Seleccione el tipo de informe que desea generar:
          </Text>

          <TouchableOpacity style={styles.button} onPress={estudiantesPress}>
            <FontAwesome name="user" size={60} color="#C3D730" />
            <Text style={styles.buttonText}>
              Informe detallado por estudiante
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={programasPress}>
            <FontAwesome name="book" size={60} color="#C3D730" />
            <Text style={styles.buttonText}>
              Informe por programa académico
            </Text>
          </TouchableOpacity>
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
