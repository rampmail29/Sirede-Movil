// components/DrawerNavi.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabNavi from "./TabInicio";
import Perfil from "./Perfil";
import SireBot from "./SireBot";
import Reporte from "./Reporte";
import AcercaDe from "./AcercaDe";
import Cargar from "./Cargar";
import SideBar from "./SideBar";

const Drawer = createDrawerNavigator();

export default function DrawerNavi() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#F0FFF2" },
        drawerHideStatusBarOnOpen: true,
        drawerStyle: { width: "74.9%", backgroundColor: "#F0FFF2" },
        drawerActiveTintColor: "#34531F",
        drawerActiveBackgroundColor: "#C3D730",
        drawerInactiveTintColor: "#B3B3B3",
        drawerLabelStyle: { fontSize: 16, fontFamily: "Montserrat-Medium" },
        headerTintColor: "#34531F",
        headerTitleStyle: { display: "none" },
      }}
    >
      {/* Tab principal dentro del Drawer */}
      <Drawer.Screen
        name="SIREDE Móvil"
        component={TabNavi}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "SIREDE Móvil",
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
        name="Cargar"
        component={Cargar}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "cloud-upload-sharp" : "cloud-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
