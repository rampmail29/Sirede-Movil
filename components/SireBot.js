import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const SireBot = () => {
  return (
    <View style={styles.container}>
        <View style={styles.container1}> 
            <FontAwesome5 name="robot" size={100} color="#4CAF50" />
            <Text style={styles.title}>SireBot está en construcción</Text>
            <Text style={styles.subtitle}>¡Muy pronto!</Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  // Centra verticalmente
    alignItems: 'center',       // Centra horizontalmente
    backgroundColor: '#fff',

  }, container1: {
    width:'100%',
    justifyContent: 'center',  // Centra verticalmente
    alignItems: 'center',       // Centra horizontalmente
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginTop: 20,              // Separación del icono
    textAlign: 'center',        // Asegura que el texto está centrado
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
    fontFamily: 'Montserrat',
    textAlign: 'center',        // Asegura que el texto está centrado
  },
});

export default SireBot;
