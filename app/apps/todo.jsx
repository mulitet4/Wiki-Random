import { Text, View, TextInput } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { getTodos } from '../../components/db';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons'; 


const Todo = () => {
  let [token, setToken] = useState("");
  let [todos, setTodos] = useState([]);

  // -------
  // Helpers
  // -------
  async function onDelete(id) {
    let [success, responseOrError] = await deleteTodo(id, await SecureStore.getItemAsync("user_token"));
    
    if (!success) {
      setError(true);
      return;
    }

    setTodos(responseOrError.todo_items);
    return;
  }

  async function onChange(id, label) {
    // API call using db.js
    let [success, responseOrError] = await changeTodo(id, label, await SecureStore.getItemAsync("user_token"));
    
    if (!success) {
      setError(true);
      return;
    }
    
    setTodos(responseOrError.todo_items);
    return;
  }

  async function onAdd() {
    if (newTodo === "") {
      return;
    }

    // API call using db.js
    let [success, responseOrError] = await addTodo(await SecureStore.getItemAsync("user_token"), newTodo);

    if (!success) {
      setError(true);
      return;
    }

    setTodos([...todos, 
      {
        id: responseOrError.added_item.id,
        label: responseOrError.added_item.label
      }
    ]);
    setNewTodo("");
  }

  async function getTodosInteral(){
    let [success, responseOrError] = await getTodos(await SecureStore.getItemAsync("user_token"));
    // setLoading(false);

    if (!success) {
      // setError(true);
      return;
    }
    
    setTodos(responseOrError.todo_items);
    return;
  }

  useEffect(() => {
    getTodosInteral();
  }, [])


  return (
    <SafeAreaView className="bg-[#D9D6CC] h-full flex">
      <View className="flex-1">
      {
        todos.map((todo)=>{
          console.log(todo);
          return <View key={todo.id} id={todo.id} className="bg-[#ffffff80] p-3 mt-3 mx-3 rounded-xl flex flex-row items-center">
            <Feather name='square' size={24} color={"black"}></Feather>
            <Text className="text-lg ml-2">
              {todo.label}
            </Text>
          </View>
        })
      }

      </View>
      <TextInput className="bg-[#ffffff80] text-lg p-3 m-3 rounded-xl" placeholder='Enter todo'></TextInput>
    </SafeAreaView>
  )
}

export default Todo