import React, { useState, useEffect } from 'react';
import { View, ImageBackground, Image, Text, StyleSheet, SafeAreaView } from 'react-native';
import * as Font from 'expo-font';
import { ScrollView } from 'react-native-gesture-handler';

const AcercaDe = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFontsAsync = async () => {
    try {
      await Font.loadAsync({
        'Montserrat-Bold': require('../assets/fonts/Montserrat/Montserrat-Bold.ttf'),
        'Montserrat-SemiBold': require('../assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
        'Montserrat-Medium': require('../assets/fonts/Montserrat/Montserrat-Medium.ttf'),
        'Montserrat-Black': require('../assets/fonts/Montserrat/Montserrat-Black.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  useEffect(() => {
    loadFontsAsync();
  }, []);

  return fontsLoaded ?(
    <SafeAreaView style={styles.containerPrincipal}> 
    <ImageBackground
      source={require('../assets/fondoinicio.jpg')} // Ruta de tu imagen de fondo
      style={styles.background}
    >
      <ScrollView> 
      <View style={styles.container}>

        <Text style={styles.titulo}>SIREDE Móvil</Text>
        <Text style={styles.version}>Versión 1.1.0</Text>
        <Text style={styles.subtext2}>Esta aplicación es parte de un proyecto de grado del programa
           de Ingeniería de Telecomunicaciones de las UTS. 
           El propósito de esta app es facilitar la gestión de Retención y Deserción de todos los
           estudiantes matriculados que se carguen por programa académico. </Text>

           <View style={styles.logosContainer}>
            <Image
              style={styles.logosImage}
              source={require("../assets/logosTelecoCuadrado4.png")} // Ruta de tu foto
            />
          </View>
       
              <Text style={styles.subtext1}>Ayúdanos a mejorar</Text>
        <Text style={styles.subtext2}>Si encuentra algún error o tiene algún problema,
              envíe un informe de error desde el Menú lateral, en la opcion 'Reporte'. </Text>
        <Text style={styles.subtext2}>Si hay una característica en particular que esté dentro del contexto
              del funcionamiento de SIREDE y le gustaria que se agregara a la aplicación, no dude en
              contactarnos.</Text>
        <Text style={styles.subtext3}>Desarrollador</Text>

        <View style={styles.pradaContainer}> 
          <View style={styles.imageContainer}>
            <Image
              style={styles.profileImage}
              source={require("../assets/prada.jpg")} // Ruta de tu foto
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>Héctor Andrés Prada Vargas</Text>
            <Text style={styles.descriptionText}>Ingeniero de Telecomunicaciones</Text>
            <Text style={styles.descriptionText}>haprada@uts.edu.co</Text>
            <Text style={styles.descriptionText}>+57 318 491 2470</Text>
          </View>
        </View>

{
        <View style={styles.mogollonContainer}> 
        <View style={styles.imageContainer}>
          <Image
            style={styles.profileImage}
            source={require("../assets/mogollon.jpg")} // Ruta de tu foto
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>Andrés Sebastian Mogollon Rubio</Text>
          <Text style={styles.descriptionText}>Ingeniero de Telecomunicaciones</Text>
          <Text style={styles.descriptionText}>amogollon@uts.edu.co</Text>
          <Text style={styles.descriptionText}>+57 317 653 1091</Text>
        </View>
        </View>
        
}
        

      </View>
      </ScrollView>
    </ImageBackground>
    </SafeAreaView>
  ): null;
};

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta la imagen de fondo para cubrir toda la pantalla
  },
  container: {
    flex: 1,
    padding: 30,
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'red',     // Color del borde
  },
  titulo:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 45,
    marginBottom: 5,
    color: '#C3D730', // Color del texto

  },
  version:{
    fontFamily: 'Montserrat-Medium',
    fontSize: 15,
    marginBottom:20,
    color: '#132F20', // Color del texto
  },
  subtext1:{
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 27,
    marginBottom: 8,
    color: '#34531F', // Color del texto
  },
  subtext2:{
    fontFamily: 'Montserrat-Medium',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'justify',
    color: '#132F20', // Color del texto
  },
  subtext3:{
    fontFamily: 'Montserrat-Bold',
    fontSize: 30,
    marginTop:25,
    marginBottom: 15,
    textAlign: 'center',
    color: '#34531F', // Color del texto
  },
  pradaContainer:{
    marginBottom:20,
    backgroundColor:'white',
    borderRadius:40,
    borderWidth: 3,          // Ancho del borde
    borderColor: '#34531F',     // Color del borde

  },
  mogollonContainer:{
    borderRadius:40,
    backgroundColor:'white',
    borderWidth: 3,          // Ancho del borde
    borderColor: '#34531F',     // Color del borde

  },
  imageContainer: {
    alignItems: 'center',
    marginTop:15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  
  },
  logosContainer: {
    alignItems: 'center',
    marginTop:15,
  },
  logosImage: {
    width: '100%',
    height: undefined,  // Dejar el height como undefined para que el aspectRatio controle la altura
    aspectRatio: 1,     // Mantiene una proporción cuadrada
    resizeMode: 'contain',  // La imagen se ajustará sin cortarse ni distorsionarse
    alignSelf: 'center',  // Centra la imagen dentro del contenedor       
  },
  
  textContainer: {
    alignItems: 'center',
    marginBottom:10,
  
  },
  nameText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    fontWeight: 'bold',
  
    color: '#C3D730', // Color del texto
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    color: 'black', // Color del texto
    
  },
});

export default AcercaDe;
