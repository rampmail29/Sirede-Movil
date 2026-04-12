import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const ConfigList = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Tu configuración está lista!</Text>
      <Text style={styles.content}>
        Recuerda que en caso de querer modificar alguno de tus datos podrás hacerlo en la sección de perfil que se encuentra en el menú lateral.
      </Text>
      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.replace('DrawerNavi')}
      >
        <Text style={styles.textBoton}>Finalizar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#6D100A',
  },
  content: {
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
    color: '#132F20',
    marginBottom: -5,
    textAlign: 'justify',
  },
  boton: {
    backgroundColor: '#6D100A',
    padding: 10,
    marginTop: 20,
    borderRadius: 50,
    width: 180,
  },
  textBoton: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ConfigList;
