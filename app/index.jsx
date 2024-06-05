import { Text } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  let [redirect, setRedirect] = useState("");
  let [loaded, setLoaded] = useState(false);

  useEffect(() => {
    checkLogin();
  }, [])

  async function checkLogin() {
    await SecureStore.isAvailableAsync();
    let token = await SecureStore.getItemAsync("user_token");
    if (token == null || token == "") {
      setRedirect("/login");
    } else {
      setRedirect("/apps");
    }
    setLoaded(true);
  }
  
  return (
    <>{loaded ? <Redirect href={redirect}/>: <Text>Hello</Text>}</>
  );
}
