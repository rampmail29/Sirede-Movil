import React from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BienvenidoScreen = ({ onNext }) => {
  return (
    <View style={styles.headerContainer}>  
      <TouchableOpacity onPress={onNext}> 
        <FontAwesome name="arrow-circle-right" size={80} color="#C3D730" />   
      </TouchableOpacity>  
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
        <Text style={styles.appTitle}>a SIREDE Móvil.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft:20,
  },
  textContainer: {
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 49,
    fontFamily: 'Montserrat-Bold',
    color: '#132F20',
    textAlign: 'center',
    marginBottom:-5,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Montserrat-Medium',
    color: '#132F20',  
  },
});

export default BienvenidoScreen;
