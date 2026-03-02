import {
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Linking,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import Snackbar from "../components/Snackbar";
import Loader from "../components/Loader";

const excludeList = [
  "Talk",
  "Help",
  "User talk",
  "User",
  "Wikipedia",
  "Category",
  "File",
  "Portal",
  "Category",
  "Category talk",
  "Template talk",
  "Template",
  "File talk",
  "User talk",
  "Wikipedia talk",
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [snack, setSnack] = useState({ visible: false, message: "", actionText: null, onAction: null });
  const [articleLimit, setArticleLimit] = useState(40);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getWikiArticles();
    setRefreshing(false);
  }, [articleLimit]);

  useEffect(() => {
    (async () => {
      try {
        const { loadFavorites, loadArticleLimit } = await import("../utils/storage");
        const [favs, savedLimit] = await Promise.all([
          loadFavorites().catch(() => []),
          loadArticleLimit().catch(() => 40)
        ]);
        setFavorites(Array.isArray(favs) ? favs : []);
        setArticleLimit(typeof savedLimit === 'number' ? savedLimit : 40);
        await getWikiArticles(savedLimit);
      } catch (error) {
        console.error('Error initializing app:', error);
        setFavorites([]);
        setArticleLimit(40);
        await getWikiArticles(40);
      }
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const { loadFavorites, loadArticleLimit, hasSettingsChanged, clearSettingsChanged } = await import("../utils/storage");
          
          // Always refresh favorites
          const favs = await loadFavorites().catch(() => []);
          setFavorites(Array.isArray(favs) ? favs : []);
          
          const saved = await loadArticleLimit().catch(() => 40);
          const settingsChanged = await hasSettingsChanged();
          
          // Only refresh articles if settings changed
          if (settingsChanged) {
            setArticleLimit(saved);
            await getWikiArticles(saved);
            await clearSettingsChanged();
          } else {
            // Just update the limit without fetching new articles
            setArticleLimit(saved);
          }
        } catch (error) {
          console.error('Error on focus:', error);
        }
      })();
    }, []),
  );

  async function getWikiArticles(overrideLimit) {
    try {
      setLoading(true);
      const limit = typeof overrideLimit === "number" ? overrideLimit : articleLimit;
      const url =
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
        `&list=random&rnlimit=${limit}&rnnamespace=0&formatversion=2`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "WikiRandom/1.0 (https://github.com/mulitet4/Wiki-Random)",
          Accept: "application/json",
        },
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Wiki API returned non-OK status", res.status, text);
        throw new Error("Failed to fetch wiki articles");
      }
      const json = JSON.parse(text);
      const randoms = (json?.query?.random) || [];
      const finalData = randoms
        .filter(p => p && p.id && p.title)
        .map((p) => ({ id: p.id, title: p.title }));
      setData(finalData);
    } catch (err) {
      console.error("Error fetching random wiki pages", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFavorite = async (item) => {
    try {
      if (!item || !item.id || !item.title) return;
      
      const exists = favorites.find((f) => f.id === item.id);
      if (exists) {
        const { removeFavorite } = await import("../utils/storage");
        await removeFavorite(item.id);
        setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        setSnack({
          visible: true,
          message: "Removed from favorites",
          actionText: "Undo",
          onAction: () => handleToggleFavorite(item),
        });
      } else {
        const { addFavorite } = await import("../utils/storage");
        await addFavorite(item);
        setFavorites((prev) => [...prev, item]);
        setSnack({
          visible: true,
          message: "Saved",
          actionText: null,
          onAction: null,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {loading ? (
        <Loader />
      ) : (
        <ScrollView
          style={{ backgroundColor: "transparent", paddingHorizontal: 16, flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {data.filter(page => page && page.id && page.title).map((page, i) => {
            const isLast = i === data.length - 1;
            const already = favorites.find((f) => f && f.id === page.id);
            return (
              <View
                key={page.id}
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
                    Linking.canOpenURL(`http://en.wikipedia.org/?curid=${page.id}`).then((supported) => {
                      if (supported) {
                        Linking.openURL(`http://en.wikipedia.org/?curid=${page.id}`);
                      } else {
                        console.log("Don't know how to open URI");
                      }
                    });
                  }}
                  android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: false, foreground: true }}
                  style={{
                    paddingTop: 12,
                    paddingBottom: 16,
                    paddingHorizontal: 16,
                    flex: 1,
                  }}
                >
                  <Text style={{ fontFamily: "Archivo", color: "white", fontSize: 18 }} className="text-white mb-1 text-lg">
                    {page.title}
                  </Text>
                  <Text style={{ fontFamily: "Archivo", color: "white", fontSize: 12 }} className="text-white text-xs">
                    Page ID: {page.id}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleToggleFavorite({ id: page.id, title: page.title })}
                  android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 10, padding: 4 }}
                >
                  <MaterialIcons
                    name={already ? "bookmark" : "bookmark-border"}
                    size={24}
                    color={already ? "white" : "#888"}
                  />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
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
