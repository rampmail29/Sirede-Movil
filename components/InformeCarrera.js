import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Animated, useWindowDimensions, ImageBackground, Text } from 'react-native';
import ProgramasAcademicos from './ProgramasAcademicos';
import CortesAcademicos from './CortesAcademicos';
import OpcionesInforme from './OpcionesInforme';

const programasAcademicosData = [
  { id: 1, title: 'Seleccione el programa académico al cual quiere consultar:', color: '#132F20' },
  { id: 2, title: 'Seleccione un cohorte para el informe:', color: '#132F20' },
  { id: 3, title: 'Seleccione alguna de las opciones dadas para generar el informe correspondiente:', color: '#132F20' },
];

const InformeCarrera = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [selectedCorteInicial, setSelectedCorteInicial] = useState(null); // Nuevo estado
  const [selectedCorteFinal, setSelectedCorteFinal] = useState(null); // Nuevo estado
  const scrollViewRef = useRef(null);

  let { width: windowWidth, height: windowHeight } = useWindowDimensions();
  windowHeight = windowHeight - 300;

  const programSelect = (programa) => {
    setSelectedProgram(programa);
    // Desplazar el ScrollView al segundo componente (CortesAcademicos)
    scrollViewRef.current.scrollTo({ x: windowWidth, animated: true });
  };

  const onNext = ({ data, selectedCorteInicial, corteFinal }) => {
    // Puedes usar data, selectedCorteInicial y selectedCorteFinal como necesites
    setAcademicData(data);
    setSelectedCorteInicial(selectedCorteInicial); 
    setSelectedCorteFinal(corteFinal); 
  
    scrollViewRef.current.scrollTo({ x: windowWidth * 2, animated: true });
  };

  // Modificar dinámicamente el título del segundo objeto en programasAcademicosData
  if (selectedProgram) {
    programasAcademicosData[1].title = `Seleccione un cohorte para el informe:`;
  }

  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
      <View style={styles.container1}>
        <Text style={styles.title}>Informe por programas y cortes académicos. </Text>
      </View>
      <SafeAreaView style={styles.container}>
        <View style={styles.textAreaContainer}>
          {programasAcademicosData.map((programa, index) => {
            const inputRange = [
              windowWidth * (index - 1),
              windowWidth * index,
              windowWidth * (index + 1),
            ];
            return (
              <Animated.Text
                key={programa.id}
                style={[
                  styles.textView,
                  {
                    transform: [
                      {
                        translateY: scrollX.interpolate({
                          inputRange,
                          outputRange: [-500, -50, 0],
                        }),
                      },
                    ],
                  },
                  {
                    opacity: scrollX.interpolate({
                      inputRange,
                      outputRange: [0, 1, 0],
                    }),
                  },
                  {
                    color: programa.color,
                  },
                ]}
              >
                {programa.title}
              </Animated.Text>
            );
          })}
        </View>
        <View style={[styles.scrollContainer, { height: windowHeight - 100 }]}>
          <ScrollView
            horizontal={true}
            style={styles.scrollViewStyle}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            ref={scrollViewRef}
          >
            {programasAcademicosData.map((programa, index) => (
              <Animated.View key={programa.id} style={{ width: windowWidth }}>
                {index === 0 ? (
                  <ProgramasAcademicos onProgramSelect={programSelect} />
                ) : index === 1 ? (
                  <CortesAcademicos selectedProgram={selectedProgram} onNext={onNext} />
                ) : (
                  <OpcionesInforme 
                  academicData={academicData} 
                  selectedCorteInicial={selectedCorteInicial} 
                  selectedCorteFinal={selectedCorteFinal} 
                />
                )}
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
      <View style={styles.indicatorContainer}>
        {programasAcademicosData.map((programa, index) => {
          const width = scrollX.interpolate({
            inputRange: [
              windowWidth * (index - 1),
              windowWidth * index,
              windowWidth * (index + 1),
            ],
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          const backgroundColor = index === 0 ? '#C3D730' : '#132F20';
          return (
            <Animated.View
              key={programa.id}
              style={[styles.normalDots, { width }, { backgroundColor }]}
            />
          );
        })}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container1: {
    alignItems: 'center',
    padding: 30,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: '#C3D730',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 110,
  },
  normalDots: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  textAreaContainer: {
    width: '100%',
    marginBottom: -50,
    textAlign: 'justify',
  },
  textView: {
    position: 'absolute',
    fontSize: 20,
    fontFamily: 'Montserrat-Medium',
    alignSelf: 'flex-start',
    padding: 30,
    width: '100%',
    textAlign: 'justify',
    marginBottom: -20,
  },
});

export default InformeCarrera;
