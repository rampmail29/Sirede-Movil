// components/TabInicio.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Inicio from "../components/Inicio";
import Estadisticas from "../components/Estadisticas";
import Informes from "../components/Informes";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

export default function TabNavi() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // Mostrar los textos debajo de los íconos
        tabBarActiveTintColor: "#C3D730",
        tabBarInactiveTintColor: "#B3B3B3",
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          borderRadius: 16,
          backgroundColor: "#2c302dff",
          borderTopWidth: 0,
          elevation: 8,
          paddingBottom: Platform.OS === "android" ? 6 : 12,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={Inicio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Estadisticas"
        component={Estadisticas}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Informes"
        component={Informes}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
