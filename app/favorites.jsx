import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import Snackbar from "../components/Snackbar";

export default function Favorites() {
  const [items, setItems] = React.useState([]);

  // refresh list each time the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const { loadFavorites } = await import("../utils/storage");
        setItems(await loadFavorites());
      })();
    }, []),
  );

  const [snack, setSnack] = React.useState({ visible: false, message: "", actionText: null, onAction: null });

  const handleRemove = async (item) => {
    const { removeFavorite } = await import("../utils/storage");
    await removeFavorite(item.id);
    setItems((prev) => prev.filter((f) => f.id !== item.id));
    setSnack({
      visible: true,
      message: "Removed from favorites",
      actionText: "Undo",
      onAction: async () => {
        const { addFavorite } = await import("../utils/storage");
        await addFavorite(item);
        setItems((prev) => [...prev, item]);
      },
    });
  };

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ScrollView
        style={{ backgroundColor: "black", paddingHorizontal: 16, flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 0, flexGrow: 1 }}
      >
        {items.length === 0 ? (
          <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            No favorites yet.
          </Text>
        ) : (
          items.map((page, i) => {
            const isLast = i === items.length - 1;
            return (
              <View
                key={page.id}
                className='rounded-lg border-[1px] border-[#27272A]'
                style={{
                  borderWidth: 1,
                  borderColor: "#27272A",
                  marginBottom: isLast ? 0 : 12,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Pressable
                  onPress={() => {
                    Linking.canOpenURL(
                      `http://en.wikipedia.org/?curid=${page.id}`,
                    ).then((supported) => {
                      if (supported) {
                        Linking.openURL(
                          `http://en.wikipedia.org/?curid=${page.id}`,
                        );
                      } else {
                        console.log("Don't know how to open URI");
                      }
                    });
                  }}
                  android_ripple={{
                    color: "rgba(255,255,255,0.3)",
                    borderless: false,
                  }}
                  style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className='pt-3 pb-4 px-4'
                    style={{
                      paddingTop: 12,
                      paddingBottom: 16,
                      paddingHorizontal: 16,
                    }}
                  >
                    {/* remove bookmark toggle */}
                    <Pressable
                      onPress={() => handleRemove(page)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        padding: 4,
                      }}
                    >
                      <MaterialIcons name="bookmark" size={24} color="white" />
                    </Pressable>
                    <Text
                      style={{
                        fontFamily: "Archivo",
                        color: "white",
                        fontSize: 18,
                      }}
                      className='text-white mb-1 text-lg'
                    >
                      {page.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Archivo",
                        color: "white",
                        fontSize: 12,
                      }}
                      className='text-white text-xs'
                    >
                      Page ID: {page.id}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
      <Snackbar
        visible={snack.visible}
        message={snack.message}
        actionText={snack.actionText}
        onAction={() => {
          snack.onAction && snack.onAction();
          setSnack((s) => ({ ...s, visible: false }));
        }}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
      />
    </SafeAreaView>
  );
}
