// components/TabInicio.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Inicio from "./Inicio";
import Estadisticas from "./Estadisticas";
import Informes from "./Informes";
import { Platform, StyleSheet, View, Text } from "react-native";

const Tab = createBottomTabNavigator();

const tabBarStyles = StyleSheet.create({
  iconText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});

export default function TabNavi() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#C3D730",
        tabBarInactiveTintColor: "#B3B3B3",
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          borderRadius: 16,
          backgroundColor: "#F0FFF2",
          borderTopWidth: 0,
          elevation: 8,
          paddingBottom: Platform.OS === "android" ? 6 : 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "ellipse";
          if (route.name === "Inicio")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Estadisticas")
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          if (route.name === "Informes")
            iconName = focused ? "document-text" : "document-text-outline";
          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={iconName} size={size} color={color} />
              <Text
                style={[
                  tabBarStyles.iconText,
                  { color: focused ? "#34531F" : "#B3B3B3" }
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Estadisticas" component={Estadisticas} />
      <Tab.Screen name="Informes" component={Informes} />
    </Tab.Navigator>
  );
}
