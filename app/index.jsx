import {
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
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
  let [loading, setLoading] = useState(true);
  let [data, setData] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getWikiArticles();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getWikiArticles();
  }, []);

  async function getWikiArticles() {
    try {
      // Ensure we show loader while fetching
      setLoading(true);

      // Use MediaWiki's random API to request a fixed number of main-namespace pages.
      // rnnamespace=0 restricts results to the main/article namespace (no prefixes like "Category:").
      const limit = 40; // number of articles to return
      // MediaWiki API requires an origin parameter for CORS requests when
      // calling from a web environment. Without it the server will return an
      // HTML error page which causes `res.json()` to throw a parse error
      // (`Unexpected character: <` or in this case `P` for "Problem").
      //
      // We also removed the duplicate `format=json` query param.
      const url =
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
        `&list=random&rnlimit=${limit}&rnnamespace=0&formatversion=2`;

      // MediaWiki requires that bots and scripts send a descriptive
      // User-Agent string.  Without it the API will start returning 403
      // responses as of T400119.  We set a minimal identifier here; for a
      // production app you should include contact information or a link to
      // your project so Wikimedia can reach you if your traffic becomes
      // problematic.
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "WikiRandom/1.0 (https://github.com/mulitet4/Wiki-Random)",
          Accept: "application/json",
        },
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Wiki API returned non-OK status", res.status, text);
        throw new Error("Failed to fetch wiki articles");
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error("Error parsing Wiki API response, body:", text);
        throw parseErr;
      }

      const randoms = (json.query && json.query.random) || [];

      // Map API response directly to our data shape. This avoids the need for local filtering
      // because the API already restricted namespace to main.
      const finalData = randoms.map((p) => ({ id: p.id, title: p.title }));

      setData(finalData);
    } catch (err) {
      console.error("Error fetching random wiki pages", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      className='bg-black text-white h-full'
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <View
        className='w-full flex justify-center items-center mb-4'
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{ fontFamily: "Archivo", color: "white", fontSize: 20 }}
          className='text-white text-xl'
        >
          Wiki Random
        </Text>
      </View>
      {loading ? (
        <></>
      ) : (
        <ScrollView
          className='bg-transparent px-4'
          style={{ backgroundColor: "transparent", paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data.map((page, i) => {
            return (
              <View
                key={page.id}
                className='rounded-lg mb-3 border-[1px] border-[#27272A]'
                style={{
                  borderWidth: 1,
                  borderColor: "#27272A",
                  marginBottom: 12,
                  borderRadius: 8,
                  overflow: "hidden", // ensure ripple is clipped
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
                  // Use a foreground ripple so the ripple is drawn on top of
                  // child contents (useful if children have backgrounds).
                  // `foreground` requires Android API >= 23; it will gracefully
                  // fall back otherwise. The `radius` gives a visible circular
                  // spread on larger items. We also keep `borderless:false`
                  // so the ripple stays inside bounds and is clipped by the
                  // parent's `overflow: 'hidden'`.
                  android_ripple={{
                    color: "rgba(255,255,255,0.32)",
                    borderless: false,
                    foreground: true,
                    radius: 220,
                  }}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      opacity: pressed ? 0.85 : 1,
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <View
                    className='pt-3 pb-4 px-4'
                    style={{
                      paddingTop: 12,
                      paddingBottom: 16,
                      paddingHorizontal: 16,
                    }}
                  >
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
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
