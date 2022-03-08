import React, { useEffect, useState, useCallback, useMemo, useContext, useReducer, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, Button, SafeAreaView, FlatList, useWindowDimensions, TextInput, Keyboard, Image, Pressable, ActivityIndicator } from 'react-native';
import { debounce, result } from 'lodash';
import axios from 'axios';

function HomeScreen({ navigation, route }) {
  const [keyword, setKeyword] = useState('')
  const [datas, setDatas] = useState([])
  const [searchResult, setSearchResult] = useState(datas)
  const [loading,setLoading] = useState(false)
  const page = useRef(0)
  const dataLits= (page)=>{
    axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${page}&limit=10`)
  .then(response => {
    setDatas([...datas, ...response.data.results])
    setLoading(false)
  })
  .catch(error => {
    console.log("error:", error);
  });
  } 
  useEffect(() => {
    dataLits()
  }, [])
  const onSearch = useCallback(debounce((keyword) => {
    const result = datas.filter(dataItem => {
      return dataItem.name.toLowerCase().includes(keyword.toLowerCase())
    })
    setSearchResult(result)
  }, 200), [])

  useEffect(() => {
    if(keyword){
      onSearch(keyword)
    } else {
      setSearchResult(datas)
    }
  }, [keyword, datas])

  const { width, height } = useWindowDimensions()
  const handleItemPress = (item) => {
    navigation.navigate('Detail', { item })
  }
  const onEndReachedHandler = (pageCurrent)=>{
    dataLits(pageCurrent+1)
    console.log(datas.length);
    setLoading(true)
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TextInput style={{ borderColor: '#000', borderWidth: 1, borderRadius: 10, marginHorizontal: 40, marginVertical: 12, paddingHorizontal: 12 }}
        placeholder='Tim pokemon'
        onChangeText={(i) => setKeyword(i)}
      />
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, paddingTop: 0 }}
        data={searchResult}
        onEndReached={()=>onEndReachedHandler(page.current)}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => { handleItemPress(item) }}>
              <View style={{
                height: 'auto',
                width: width / 2,
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomColor: '#000',
                borderBottomWidth: 1,
                marginHorizontal: 5
              }}
              >
                <Image
                  style={{ width: 200, height: 200 }}
                  source={{ uri: `https://img.pokemondb.net/sprites/omega-ruby-alpha-sapphire/dex/normal/${item.name}.png` }}
                />
                <Text>{item.name}</Text>
              </View>
            </Pressable>
          )
        }}
        numColumns={2}
        onScroll={() => {
          Keyboard.dismiss()
        }}
      />
      {loading&&<ActivityIndicator style={{flex: 1,justifyContent: "flex-end"}} animating={true}/>}
    </SafeAreaView>
  );
}

function Detail({ navigation, route }) {
  console.log(route.params.item);
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    axios.get(`${route.params.item.url}`)
      .then(response => {
        setDetail(response.data)
        console.log(response.data);
      })
      .catch(error => {
        console.log("error", error);
      });
  }, [])
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',  }}>
      <Image
        style={{ width: 200, height: 200 }}
        source={{ uri: `https://img.pokemondb.net/sprites/omega-ruby-alpha-sapphire/dex/normal/${route.params.item.name}.png` }}
      />
      <Text>Name: {route.params.item.name}</Text>

      {
        detail && (
          <>
            <Text>Height: {detail.height}</Text>
            <Text>weight: {detail.weight}</Text>
            <Text>Height: {detail.abilities[0].ability.name}</Text>
            <Text>Type: {detail.types[0].type.name}</Text>
          </>
        )
      }
    </View>
  );
}
const Stack = createNativeStackNavigator();



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  main: {},
});

export default App;
