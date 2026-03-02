import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

// slider component is provided by the community package
import Slider from '@react-native-community/slider';

export default function Settings() {
  const [limit, setLimit] = React.useState(40);
  const [inputValue, setInputValue] = React.useState('40');

  // load saved setting on mount
  React.useEffect(() => {
    (async () => {
      const { loadArticleLimit } = await import('../utils/storage');
      const saved = await loadArticleLimit();
      setLimit(saved);
      setInputValue(String(saved));
    })();
  }, []);

  const onInputChange = (value) => {
    // Allow user to type freely, including empty strings
    setInputValue(value);
  };

  const onInputBlur = async () => {
    // Validate and clamp only when user leaves the field
    const numeric = Math.min(40, Math.max(1, Number(inputValue) || 1));
    setLimit(numeric);
    setInputValue(String(numeric));
    const { saveArticleLimit } = await import('../utils/storage');
    await saveArticleLimit(numeric);
  };

  const onSliderChange = async (value) => {
    // Slider changes are validated immediately
    setLimit(value);
    setInputValue(String(value));
    const { saveArticleLimit } = await import('../utils/storage');
    await saveArticleLimit(value);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      <Text style={{ color: "white", fontSize: 24, fontFamily: "Archivo", marginBottom: 32 }}>
        Settings
      </Text>

      {/* article limit slider + input */}
      <View style={{ width: '100%' }}>
        <Text style={{ color: 'white', marginBottom: 12, fontSize: 14, fontFamily: 'Archivo' }}>Articles per refresh</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={inputValue}
            keyboardType="numeric"
            style={{
              padding: 2,
              width: 40,
              height: 26,
              borderWidth: 1,
              borderColor: '#444',
              borderRadius: 4,
              color: 'white',
              fontSize: 13,
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              fontFamily: 'Archivo',
            }}
            onChangeText={onInputChange}
            onBlur={onInputBlur}
          />
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={40}
            step={1}
            value={limit}
            minimumTrackTintColor="#666"
            maximumTrackTintColor="#333"
            thumbTintColor="#999"
            onValueChange={onSliderChange}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
