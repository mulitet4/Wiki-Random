import { Text, TextInput, Pressable } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getTodos, login } from '../components/db';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const Login = () => {
  let [username, setUsername] = useState();
  let [password, setPassword] = useState();
  let router = useRouter();

  async function _login() {
    if (!username || !password) {
      return;
    }
    let details = {
      username: username,
      password: password
    }
    let [success, tokenOrError] = await login(details);
    console.log(success, tokenOrError);
    if (!success) {
      // setError("Invalid username or password");
      return;
    }

    await SecureStore.setItemAsync("user_token", tokenOrError);
    router.replace("/apps");
    return;
  }
  return (
    <SafeAreaView className="flex items-center justify-center h-full w-full bg-[#D9D6CC] ">
      <Text 
        className="text-3xl pb-12 font-bold text-[#344E41]">
        True Do
      </Text>

      <TextInput 
        onChangeText={(text)=>{setUsername(text)}}
        placeholder='Username' 
        className="bg-[#ffffff80] px-5 py-4 rounded-xl text-lg mb-4 w-1/2 shadow-lg text-[#344E41]" 
        />

      <TextInput 
        onChangeText={(text)=>{setPassword(text)}}
        placeholder='Password' 
        className="bg-[#ffffff80] px-5 py-4 rounded-xl text-lg w-1/2 mb-4 shadow-lg text-[#344E41]"
        />

      <Pressable 
        className="bg-[#ffffff80] rounded-lg px-4 py-3 shadow-lg"
        onPress={()=>{
          _login();
        }}
        >
        <Text className="text-base text-[#344E41]">Login</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Login