import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';


const Inicio = () => {
  const scrollViewRef = useRef(null);
  const { height } = Dimensions.get('window');
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
    fadeIn(); 
  }, []);

  const handleArrowPress = () => {
    if (scrollViewRef.current) {
      const scrollOptions = {
        y: height*0.8,    
      };
      scrollViewRef.current.scrollTo(scrollOptions);
    }
  };

  const { Value, timing } = Animated;

    const opacity = new Value(0);

    const fadeIn = () => {
      timing(opacity, {
        toValue: 1,
        duration: 2000, // Duración de la animación en milisegundos
        useNativeDriver: true, // Usar el driver nativo para la animación
      }).start();
    };

  return fontsLoaded ? (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header1}>

        <Image
            source={require('../assets/fondoinicio.jpg')}
            style={{ 
              ...StyleSheet.absoluteFillObject, 
              width: '100%', 
              height: '100%' 
            }}
            resizeMode="cover"  // Usar contain si no quieres que se recorte
          />
           
            <View>
              <Image
                source={require('../assets/siredelogo.png')}
                style={styles.backgroundLogo1}
                resizeMode="contain"
              />
              </View>
              <TouchableOpacity onPress={handleArrowPress}>
                <Image
                  source={require('../assets/arrow1.gif')}
                  style={styles.arrowgif}
                />
              </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#6D100A', '#34531F']}
          style={{ flex: 1 }}
          locations={[0, 0.8]}
        >
          
          <View style={[styles.header2]}>
            <Text style={styles.text1}>
              Una aplicación diseñada para abordar el desafío de la deserción estudiantil en las Unidades Tecnológicas de Santander.
            </Text>
            </View>
        </LinearGradient>

        <LinearGradient
          colors={['#34531F', '#132F20']}
          style={{ flex: 1 }}
          locations={[0, 0.8]}
        >
          <View style={styles.header3}>
            <Text style={styles.text2}>
              Esta herramienta tiene como objetivo principal proporcionar a los usuarios administrativos una plataforma eficiente y efectiva para gestionar datos relacionados con la retención y deserción universitaria.
            </Text>
          </View>
        </LinearGradient>

          <View style={styles.header4}>
                <View style={styles.verticalContainer}>
                    <Text style={styles.text3}>
                      A través de una interfaz de usuario intuitiva, 
                      SIREDE Móvil se conecta con la base de datos de SIREDE Web, 
                      asegurando el acceso inmediato a la información en tiempo real. 
                    </Text>
                </View>

          <View style={styles.gifContainer}>
            <Image
              source={require('../assets/basedatos.gif')}
              style={styles.gif}
            />
          </View>
         </View>

         <View style={styles.header5}>
            <View style={styles.gifContainer}>
                <Image
                    source={require('../assets/servidor.gif')}
                    style={styles.gif}
              />
            </View>
            <View style={styles.verticalContainer}>
                <Text style={styles.text4}>
                La aplicación implementa análisis de datos y patrones, 
                facilitando la toma de decisiones informadas y el diseño de políticas 
                académicas efectivas. </Text>
            </View>
         </View>

         <View style={styles.header6}>
              <View style={styles.verticalContainer}>
                <Text style={styles.text5}>
                Incluye funcionalidades clave como lo son la visualización detallada 
                y gráfica de cifras de retención y deserción en la universidad, permitiendo a los 
                administrativos identificar 
                patrones y tomar medidas preventivas.  </Text>
              </View>

            <View style={styles.gifContainer}>
              <Image
                source={require('../assets/estadisticas.gif')}
                style={styles.gif}
              />
            </View>
          </View>
          <View style={styles.headerFinal}>

          </View>
        
      
          </ScrollView>
    </SafeAreaView>
  ) : null;
};
const { height } = Dimensions.get('window'); // Obtén la altura de la pantalla

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header1: {
   // backgroundColor: '#6D100A',
    justifyContent: 'center',
    alignItems: 'center',
    height: height *0.9, // Ocupa toda la pantalla
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'red',     // Color del borde
  },
  backgroundLogo1: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  arrowgif: {
    width:90, // Ajusta el ancho según tus necesidades
    height:90, // Ajusta el alto según tus necesidades
    marginTop:50,
    resizeMode: 'contain', // Ajusta el modo de redimensionamiento
    top:height *0.01, // Ajusta la distancia desde la parte superior
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'red',     // Color del borde
  },
  header2: {
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.60, // Ocupa toda la pantalla
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  text1:{
    fontSize:40,
    margin: 10,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color:'#F8E9D4',
  },
  header3: {
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.50, // Ocupa toda la pantalla
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'orange',     // Color del borde
  },
  text2:{
    fontFamily: 'Montserrat-Medium',
   margin:10,
    textAlign: 'center', // Justificar el texto
    fontSize: 25,
    color:'#F8E9D4',
  },
  header4: {
    flexDirection: 'row', // División horizontal
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.30, // Ocupa toda la pantalla
    backgroundColor: '#F8E9D4',
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  verticalContainer: {
    flex: 7, // 70% para la parte izquierda
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'red',     // Color del borde
  },
  text3: {
    fontFamily: 'Montserrat-Medium',
    textAlign: 'justify',
    color:'#34531F',
    margin:15,
    fontSize: 17,
  },
  header5: {
    flexDirection: 'row', // División horizontal
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.30, // Ocupa toda la pantalla
    backgroundColor: '#C3D730',
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  text4: {
    fontFamily: 'Montserrat-Medium',
    textAlign: 'justify',
    color:'#132F20',
    margin:15,
    fontSize: 17,
  },
  header6: {
    flexDirection: 'row', // División horizontal
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.38, // Ocupa toda la pantalla
    backgroundColor: '#34531F',
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  text5: {
    fontFamily: 'Montserrat-Medium',
    textAlign: 'justify',
    color:'#F8E9D4',
    margin:15,
    fontSize: 17,
  },
  headerFinal: {
    flexDirection: 'row', // División horizontal
    justifyContent: 'center',
    alignItems: 'center',
    height:height*0.05, // Ocupa toda la pantalla
    backgroundColor: 'white',
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  gifContainer: {
    flex: 3, // 30% para la parte derecha
    margin:15,
    alignItems: 'center',
    justifyContent: 'center', // Centrar verticalmente
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'blue',     // Color del borde
  },
  gif: {
    width:150, // Ajusta el ancho según tus necesidades
    height:150, // Ajusta el alto según tus necesidades
    resizeMode: 'contain', // Ajusta el modo de redimensionamiento
    //borderWidth: 2,          // Ancho del borde
    //borderColor: 'red',     // Color del borde 
  },

});

export default Inicio;
