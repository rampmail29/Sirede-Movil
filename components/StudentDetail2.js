import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FontAwesome } from '@expo/vector-icons';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { API_BASE_URL } from './Config';

const StudentDetail2 = ({ route, navigation }) => {
  const { documento, corteFinal } = route.params;
  const [student, setStudent] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const obtenerDetallesEstudiante = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/estudiantes/${documento}`, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ corteFinal }), // Enviar parámetros en el cuerpo
        });
        const data = await response.json();
        setStudent(data);
        console.log(data);
      } catch (error) {
        console.error('Error al obtener detalles del estudiante:', error);
      } finally {
        setLoading(false);
      }
    };
    

    const obtenerImagenEstudiante = async () => {
      try {
        const extensions = ['png', 'jpg', 'jpeg'];
        let imageUrl = null;

        for (let ext of extensions) {
          try {
            const imageRef = ref(storage, `estudiantes/${documento}.${ext}`);
            const url = await getDownloadURL(imageRef);
            imageUrl = url;
            break;
          } catch (error) {
            // No es necesario manejar errores aquí
          }
        }

        setImageUri(imageUrl || null);
      } catch (error) {
        console.error('Error al obtener la imagen del estudiante:', error);
      }
    };

    const cargarDatos = async () => {
      await Promise.all([obtenerDetallesEstudiante(), obtenerImagenEstudiante()]);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    };

    cargarDatos();
  }, [documento, corteFinal]);

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const resizedUri = await resizeImage(uri);
        uploadImage(resizedUri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Ajusta el ancho según sea necesario
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Ajusta la compresión según sea necesario
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error al redimensionar la imagen:', error);
      return uri; // En caso de error, devuelve la URI original
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const allowedExtensions = ['png', 'jpg', 'jpeg'];
      let uploaded = false;

      for (let ext of allowedExtensions) {
        try {
          const storageRef = ref(storage, `estudiantes/${documento}.${ext}`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          setImageUri(url);
          uploaded = true;
          break;
        } catch (error) {
          console.error(`Error al subir la imagen ${ext}:`, error);
        }
      }

      if (!uploaded) {
        console.error('No se pudo subir la imagen con ninguna extensión válida.');
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  };

      const capitalizeFirstLetter = (string) => {
        return string
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

        const formatDate = (dateString) => {
          return dateString.split('T')[0];
        };
        
        const calcularEdad = (fechaNacimiento) => {
          const hoy = new Date();
          const fechaNac = new Date(fechaNacimiento);
          let edad = hoy.getFullYear() - fechaNac.getFullYear();
          const mes = hoy.getMonth() - fechaNac.getMonth();

          if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
          }

          return edad;
        };

        return (
          <SafeAreaProvider>
            <ImageBackground source={require('../assets/fondoestudiante.jpg')} style={styles.backgroundImage}>
              <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.container}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#34531F" />
                      <Text style={styles.loadingText}>Cargando...</Text>
                    </View>
                  ) : (
                    <>
                      {student && (
                        <>
                          <Text style={styles.title}>Información del estudiante.</Text>
                          <View style={styles.infoContainer}>
                            {imageUri ? (
                              <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                                <ImageBackground source={{ uri: imageUri }} style={styles.image} />
                                <View style={styles.editIcon}>
                                  <FontAwesome name="edit" size={20} color="#34531F" />
                                </View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                                <View style={styles.imagePlaceholder}>
                                  <FontAwesome name="user" size={100} color="#575756" />
                                  <Text style={styles.uploadText}>Subir Foto</Text>
                                </View>
                              </TouchableOpacity>
                            )}
                            <Text style={styles.textName}>{capitalizeFirstLetter(student.nombres)} {capitalizeFirstLetter(student.apellidos)}</Text>
                            <Text style={styles.textCarrera}>{capitalizeFirstLetter(student.programa)}</Text>
      
                            <View style={styles.textInfo}>
                              <View style={styles.infoItem1}>
                                <FontAwesome name="birthday-cake" size={25} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Fecha de Nacimiento:</Text>
                                  <Text style={styles.text}>{formatDate(student.fecha_nacimiento)}</Text>
                                </View>
                              </View>
      
                              <View style={styles.separator1} />
      
                              <View style={styles.infoItem1}>
                                <FontAwesome name="child" size={35} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Edad:</Text>
                                  <Text style={styles.text}>{calcularEdad(student.fecha_nacimiento)} años</Text>
                                </View>
                              </View>
      
                              <View style={styles.separator2} />
      
                              <View style={styles.infoItem1}>
                                <FontAwesome name="id-card" size={23} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Documento:</Text>
                                  <Text style={styles.text}>{student.documento}</Text>
                                </View>
                              </View>
      
                              <View style={styles.separator3} />
      
                              <View style={styles.infoItem1}>
                                <FontAwesome name="calendar" size={25} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Año de Matrícula:</Text>
                                  <Text style={styles.text}>{student.año_matricula}</Text>
                                </View>
                              </View>
      
                              <View style={styles.separator4} />
      
                              <View style={styles.infoEstado}>
                                <FontAwesome name="info-circle" size={30} color="#34531F" />
                                <View>
                                  <Text style={styles.label}>Estado:</Text>
                                  <Text style={styles.text}>{student.estado_estudiante}</Text>
                                </View>
                              </View>
      
                              {student.fecha_grado && (
                                <>
                                  <View style={styles.separator5} />
                                  <View style={styles.infoItem1}>
                                    <FontAwesome name="graduation-cap" size={25} color="#34531F" />
                                    <View>
                                      <Text style={styles.label}>Fecha de Graduación:</Text>
                                      <Text style={styles.text}>{formatDate(student.fecha_grado)}</Text>
                                    </View>
                                  </View>
                                </>
                              )}
      
                            </View>
      
                            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                              <Text style={styles.buttonText}>Volver</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </View>
              </ScrollView>
            </ImageBackground>
          </SafeAreaProvider>
        );
      };

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    marginTop:40,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    padding:30,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'center',
    textAlign:'center',
    marginBottom: 70,
    color: 'white',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    marginBottom: 20,
    width: '100%',
    height: '100%', 
    alignItems:'center'  
  },
  text: {
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    marginLeft:10
  },
  label: {
    fontFamily: 'Montserrat-Bold',
    color: '#C3D730',
    fontSize:20,
    marginLeft:10
  },
  textInfo: {
    marginTop:10,
    width:'90%',
    marginBottom:20
  },
  textName: {
    fontSize: 23,
    fontFamily: 'Montserrat-Bold',
    marginTop:15,
    marginBottom: 5,
    textAlign:'center',
    color:'#6D100A',  
  },
  textCarrera: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    textAlign:'center',
    marginBottom:20
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    marginTop: -100, // Ajustar según el tamaño de la imagen y el diseño general
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 30, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  
  image: {
    width: 170,
    height: 170,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Fondo blanco mientras se carga la imagen
    borderWidth: 8, // Agrega un borde
    borderColor: 'white', // Color del borde
    elevation: 10, // Esto es para Android, donde la propiedad de sombra es diferente
  },
  editIcon: {
    position: 'absolute',
    bottom: 10, // Ajusta este valor según sea necesario
    right: 10, // Ajusta este valor según sea necesario
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // Esto es para Android
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    borderWidth: 8,
    borderColor: 'white',
    elevation: 10
  },
  uploadText: {
    fontFamily: 'Montserrat-Medium',
    color: '#34531F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  button: {
    backgroundColor: '#6D100A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 60,
    width:120,
    justifyContent:'center'
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  separator: {
    height: 2,
    width: '30%',
    backgroundColor: '#6D100A',
    marginVertical: 10,
  },
  separator1: {
    height: 5,
    width: '73%',
    backgroundColor: '#6D100A',
    marginVertical:5,
    marginBottom: 15,
    borderRadius:200,
  },
  separator2: {
    height: 5,
    width: '30%',
    backgroundColor: '#6D100A',
    marginVertical:5,
    marginBottom: 15,
    borderRadius:200,
  },
  separator3: {
    height: 5,
    width: '47%',
    backgroundColor: '#6D100A',
    marginVertical:5,
    marginBottom: 15,
    borderRadius:200,
  },
  separator4: {
    height: 5,
    width: '60%',
    backgroundColor: '#6D100A',
    marginVertical:5,
    marginBottom: 15,
    borderRadius:200,
  },
  separator5: {
    height: 5,
    width: '40%',
    backgroundColor: '#6D100A',
    marginVertical:5,
    marginBottom: 15,
    borderRadius:200,
  },
  infoItem1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 'auto', // Mueve el item a la derecha
  },
  infoEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 'auto', // Mueve el item a la derecha
 
  },
  
});

export default StudentDetail2;
