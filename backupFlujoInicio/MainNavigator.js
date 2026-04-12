/* // components/MainNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VideoScreen from "./VideoScreen";
import InicioSesion from "./InicioSesion";
import DrawerNavi from "./DrawerNavi";
import PasswordChangeScreen from "./PasswordChangeScreen";
const Stack = createNativeStackNavigator();
import StudentDetail2 from "./StudentDetail2";
import CerrarSesion from "./CerrarSesion";
import AccessRequestForm from "./AccessRequestForm";
import InitialSetupScreen from "./InitialSetupScreen";
import ConfigList from "./ConfigList";
import TabInicio from "./TabInicio";

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="VideoScreen">
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InicioSesion"
        component={InicioSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrawerNavi"
        component={DrawerNavi}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabInicio"
        component={TabInicio}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetail2"
        component={StudentDetail2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CerrarSesion"
        component={CerrarSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessRequest"
        component={AccessRequestForm}
        options={{ headerShown: false, title: "Solicitud de Acceso" }}
      />
      <Stack.Screen
        name="PasswordChangeScreen"
        component={PasswordChangeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InitialSetupScreen"
        component={InitialSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConfigList"
        component={ConfigList}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
 */
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

// Screens
import VideoScreen from "../components/VideoScreen";
import InicioSesion from "../components/InicioSesion";
import AcercaDe from "../components/AcercaDe";
import Reporte from "../components/Reporte";
import Graficar from "../components/GraficarEstadisticas";
import GraficarCohorte from "../components/GraficarPorCohorte";
import GraficarMatriculas from "../components/GraficarPorMatriculas";
import GraficarPdf from "../components/GraficarPdf";
import InformeEstudiante from "../components/InformeEstudiante";
import StudentDetail from "../components/StudentDetail";
import StudentDetail2 from "../components/StudentDetail2";
import InformeCarrera from "../components/InformeCarrera";
import CerrarSesion from "../components/CerrarSesion";
import AccessRequestForm from "../components/AccessRequestForm";
import PasswordChangeScreen from "../components/PasswordChangeScreen";
import InitialSetupScreen from "../components/InitialSetupScreen";
import ConfigList from "../components/ConfigList";
import SideBar from "../components/SideBar";
import Perfil from "../components/Perfil";
import SireBot from "../components/SireBot";
import Cargar from "../components/Cargar";
import TabInicio from "../components/TabInicio";
import Estadis_Matricula from "../components/Estadis_Matricula";
import Estadis_Cohorte from "../components/Estadis_Cohorte";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabBarStyles = StyleSheet.create({
  iconText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
});

//DrawerNavi()
function DrawerNavi() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#F0FFF2" },
        drawerHideStatusBarOnOpen: true,
        drawerStyle: { width: "74.9%", backgroundColor: "#F0FFF2" },
        drawerActiveTintColor: "#34531F",
        drawerActiveBackgroundColor: "#C3D730",
        drawerInactiveTintColor: "#B3B3B3",
        drawerLabelStyle: { fontSize: 16, fontFamily: "Montserrat-Medium" },
        headerTintColor: "#34531F",
        headerTitleStyle: { display: "none" },
      })}
    >
      <Drawer.Screen
        name="SIREDE Móvil"
        component={TabNavi}
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="menu"
              size={28}
              color="#34531F"
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 12 }}
            />
          ),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Perfil"
        component={Perfil}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="SireBot"
        component={SireBot}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Reporte"
        component={Reporte}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Acerca de"
        component={AcercaDe}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={
                focused ? "information-circle" : "information-circle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Cargar CSV"
        component={Cargar}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "cloud-upload" : "cloud-upload-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function TabNavi() {
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
                  { color: focused ? "#34531F" : "#B3B3B3" },
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
      })}
    >
      {/* Ocultas en tab bar */}
      <Tab.Screen
        name="Graficar"
        component={Graficar}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="GraficarCohorte"
        component={GraficarCohorte}
        options={{ tabBarButton: () => null, unmountOnBlur: true }}
      />
      <Tab.Screen
        name="GraficarMatriculas"
        component={GraficarMatriculas}
        options={{ tabBarButton: () => null, unmountOnBlur: true }}
      />
      <Tab.Screen
        name="GraficarPdf"
        component={GraficarPdf}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="InformeEstudiante"
        component={InformeEstudiante}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="StudentDetail"
        component={StudentDetail}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="InformeCarrera"
        component={InformeCarrera}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Estadis_Cohorte"
        component={GraficarCohorte}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Estadis_Matricula"
        component={GraficarMatriculas}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="VideoScreen">
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InicioSesion"
        component={InicioSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrawerNavi"
        component={DrawerNavi}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="TabInicio"
        component={TabInicio}
        options={{ headerShown: false }}
      /> */}
      {/* los demás screens */}
      <Stack.Screen
        name="StudentDetail2"
        component={StudentDetail2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CerrarSesion"
        component={CerrarSesion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccessRequest"
        component={AccessRequestForm}
        options={{ headerShown: false, title: "Solicitud de Acceso" }}
      />
      <Stack.Screen
        name="PasswordChangeScreen"
        component={PasswordChangeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InitialSetupScreen"
        component={InitialSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConfigList"
        component={ConfigList}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
