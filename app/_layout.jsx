import { Slot, SplashScreen, Tabs } from "expo-router";
// icons for tabs
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts, fontError } from "expo-font";
import { useEffect } from "react";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function () {
  const [fontsLoaded] = useFonts({
    Archivo: require("../assets/fonts/Archivo.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the bottom tab navigator once fonts/splash are ready.  Expo Router
  // provides a simple <Tabs> component that maps to the file system; we also
  // declare the three tabs explicitly so we can customize their titles/icons
  // later if desired.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopColor: "#111",
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='favorites'
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='favorite' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='settings' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
