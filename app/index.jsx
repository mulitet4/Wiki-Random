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
      const { loadFavorites, loadArticleLimit } = await import("../utils/storage");
      const [favs, savedLimit] = await Promise.all([loadFavorites(), loadArticleLimit()]);
      setFavorites(favs);
      setArticleLimit(savedLimit);
      getWikiArticles(savedLimit);
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const { loadArticleLimit } = await import("../utils/storage");
        const saved = await loadArticleLimit();
        setArticleLimit(saved);
        getWikiArticles(saved);
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
      const randoms = (json.query && json.query.random) || [];
      const finalData = randoms.map((p) => ({ id: p.id, title: p.title }));
      setData(finalData);
    } catch (err) {
      console.error("Error fetching random wiki pages", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFavorite = async (item) => {
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
          {data.map((page, i) => {
            const isLast = i === data.length - 1;
            const already = favorites.find((f) => f.id === page.id);
            return (
              <Pressable
                key={page.id}
                onPress={() => {
                  Linking.canOpenURL(`http://en.wikipedia.org/?curid=${page.id}`).then((supported) => {
                    if (supported) {
                      Linking.openURL(`http://en.wikipedia.org/?curid=${page.id}`);
                    } else {
                      console.log("Don't know how to open URI");
                    }
                  });
                }}
                android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: false }}
                style={{
                  borderWidth: 1,
                  borderColor: "#27272A",
                  marginBottom: isLast ? 0 : 12,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <View style={{ paddingTop: 12, paddingBottom: 16, paddingHorizontal: 16 }}>
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
                  <Text style={{ fontFamily: "Archivo", color: "white", fontSize: 18 }} className="text-white mb-1 text-lg">
                    {page.title}
                  </Text>
                  <Text style={{ fontFamily: "Archivo", color: "white", fontSize: 12 }} className="text-white text-xs">
                    Page ID: {page.id}
                  </Text>
                </View>
              </Pressable>
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
