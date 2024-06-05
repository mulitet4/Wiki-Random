import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

const Calendar = () => {
  return (
    <SafeAreaView className="bg-[#D9D6CC] h-full">
      <Text className="text-4xl font-bold">Calendar</Text>
    </SafeAreaView>
  )
}

export default Calendar