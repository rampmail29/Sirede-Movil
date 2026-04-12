import React, { useRef } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Animated, 
  useWindowDimensions, 
  ImageBackground,
 } from 'react-native';

import InfoPerfilScreen from './InfoPerfilScreen';
import BienvenidoScreen from './BienvenidoScreen';
import ConfigList from './ConfigList';

const InitialSetupScreen = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const scrollToNextPage = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: windowWidth, animated: true });
    }
  };

  const scrollToNextPage2 = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: windowWidth*2, animated: true });
    }
  };

  return (
    <ImageBackground source={require('../assets/fondoinicio.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          style={styles.scrollViewStyle}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Primera pantalla */}
          <View style={[styles.contentContainer, { width: windowWidth, height: windowHeight }]}>
            <BienvenidoScreen onNext={scrollToNextPage} />       
          </View>

          {/* Segunda pantalla */}
          <View style={[styles.contentContainer, { width: windowWidth, height: windowHeight }]}>
            <InfoPerfilScreen onNext={scrollToNextPage2}/>     
          </View>
  
          {/* Tercera pantalla */}
          <View style={[styles.contentContainer, { width: windowWidth, height: windowHeight }]}> 
            <ConfigList/>
          </View>
        
        </ScrollView>

        {/* Indicador de puntos */}
        <View style={styles.indicatorContainer}>
          {[0, 1, 2 ].map((_, index) => {
            const inputRange = [
              windowWidth * (index - 1),
              windowWidth * index,
              windowWidth * (index + 1),
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });

            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#132F20', '#C3D730', '#132F20'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.normalDots,
                  { width: dotWidth, backgroundColor: dotColor }
                ]}
              />
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  scrollViewStyle: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  normalDots: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default InitialSetupScreen;
