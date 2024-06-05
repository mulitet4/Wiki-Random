import { Tabs } from "expo-router"
import { FontAwesome } from "@expo/vector-icons"

const _layout = () => {
  return (
    <Tabs screenOptions={{
      
      // tabBarShowLabel: false,
      headerShown: false,
      tabBarStyle: {
        position: "absolute",
        marginLeft: 70,
        marginRight: 70,
        marginBottom: 35,
        height: 75,
        borderRadius: 10,
        backgroundColor: "#ffffff80",
        elevation: 0
      },
      tabBarItemStyle: {
        marginBottom: 10,
        marginTop: 10,
      },
      // tabBarInactiveTintColor: "",
      tabBarActiveTintColor: "#344E41"

      }} >
      <Tabs.Screen 
        name="todo" 
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="check" size={24} color={color}/>
          ),
        }}
      />
      <Tabs.Screen 
        name="notes" 
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="sticky-note" size={24} color={color}/>
          ),
        }}
      />
      <Tabs.Screen 
        name="calendar" 
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" size={24} color={color}/>
          ),
        }}
      />
    </Tabs>
  )
}

export default _layout