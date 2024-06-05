import {
  Text,
  View,
  ScrollView,
  TouchableNativeFeedback,
  RefreshControl,
  Linking,
} from 'react-native';
import { Link, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';

const excludeList = [
  'Talk',
  'Help',
  'User talk',
  'User',
  'Wikipedia',
  'Category',
  'File',
  'Portal',
  'Category',
  'Category talk',
  'Template talk',
  'Template',
  'File talk',
  'User talk',
  'Wikipedia talk',
];

export default function App() {
  let [loading, setLoading] = useState(true);
  let [data, setData] = useState();
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
    let _randInts = [];
    for (let i = 0; i <= 40; i++) {
      _randInts.push(Math.floor(Math.random() * 21529208));
    }

    let concatNums = _randInts.join('%7C');

    let data = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${concatNums}`
    );

    json = await data.json();
    let pages = json.query.pages;
    let pageNumbers = Object.keys(pages);

    let finalData = [];

    pageNumbers.map((pageNumber) => {
      let pageDataKeys = Object.keys(json.query.pages[pageNumber]);
      if (!pageDataKeys.includes('title')) {
        return;
      }
      let maybeCategory = pages[pageNumber].title.split(':')[0];
      if (excludeList.includes(maybeCategory)) {
        return;
      }

      finalData.push({
        id: pages[pageNumber].pageid,
        title: pages[pageNumber].title,
      });
    });

    setData(finalData);
    setLoading(false);
  }

  return (
    <SafeAreaView className='bg-black text-white h-full'>
      <View className='w-full flex justify-center items-center mb-4'>
        <Text style={{ fontFamily: 'Archivo' }} className='text-white text-xl'>
          Wiki Random
        </Text>
      </View>
      {loading ? (
        <></>
      ) : (
        <ScrollView
          className='bg-transparent px-4'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data.map((page, i) => {
            return (
              <View
                key={page.id}
                tw='rounded-lg mb-3 border-[1px] border-[#27272A] active:bg-red-500 transition-all'
              >
                <TouchableNativeFeedback
                  onPress={() => {
                    Linking.canOpenURL(
                      `http://en.wikipedia.org/?curid=${page.id}`
                    ).then((supported) => {
                      if (supported) {
                        Linking.openURL(
                          `http://en.wikipedia.org/?curid=${page.id}`
                        );
                      } else {
                        console.log("Don't know how to open URI");
                      }
                    });
                  }}
                  background={TouchableNativeFeedback.Ripple('#4a4a4f', true)}
                >
                  <View className='pt-3 pb-4 px-4'>
                    <Text
                      style={{ fontFamily: 'Archivo' }}
                      className='text-white mb-1 text-lg'
                    >
                      {page.title}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Archivo' }}
                      className='text-white text-xs'
                    >
                      Page ID: {page.id}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
