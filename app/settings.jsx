import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

// slider component is provided by the community package
import Slider from '@react-native-community/slider';

export default function Settings() {
  const [limit, setLimit] = React.useState(40);

  // load saved setting on mount
  React.useEffect(() => {
    (async () => {
      const { loadArticleLimit } = await import('../utils/storage');
      const saved = await loadArticleLimit();
      setLimit(saved);
    })();
  }, []);

  const onLimitChange = async (value) => {
    // slider returns a number, but TextInput could send string
    const numeric = Math.min(40, Math.max(1, Number(value)));
    setLimit(numeric);
    const { saveArticleLimit } = await import('../utils/storage');
    await saveArticleLimit(numeric);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      <Text style={{ color: "white", fontSize: 24, fontFamily: "Archivo", marginBottom: 24 }}>
        Settings
      </Text>

      {/* article limit slider + input */}
      <View style={{ width: '100%' }}>
        <Text style={{ color: 'white', marginBottom: 8 }}>Articles per refresh: {limit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={40}
            step={1}
            value={limit}
            minimumTrackTintColor="#4da6ff"
            maximumTrackTintColor="#555"
            thumbTintColor="#4da6ff"
            onValueChange={onLimitChange}
          />
          <TextInput
            value={String(limit)}
            keyboardType="numeric"
            style={{
              marginLeft: 12,
              padding: 8,
              width: 60,
              borderWidth: 1,
              borderColor: '#444',
              borderRadius: 4,
              color: 'white',
              fontSize: 18,
              textAlign: 'center',
            }}
            onChangeText={onLimitChange}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
