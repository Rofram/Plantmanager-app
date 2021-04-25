import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';

import api from '../services/api';

import colors from '../styles/colors';
import fonts from '../styles/fonts';

import { Header } from '../components/Header';
import { EnvironmentButton } from '../components/EnvironmentButton';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import { Load } from '../components/Load';

interface EnvironmentProps {
  key: string;
  title: string;
}

interface PlantsProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: string[];
  frequency: {
    times: number;
    repeat_every: string;
  }
}

export function PlantSelect() {
  const [ environments, setEnvironments ] = useState<EnvironmentProps[]>([]);
  const [ plants, setPlants ] = useState<PlantsProps[]>([]);
  const [ filteredPlants, setFilteredPlants ] = useState<PlantsProps[]>([]);
  const [ environmentActive, setEnvironmentActive ] = useState('all');
  const [ loading, setLoading ] = useState(true);

  const [ page, setPage] = useState(1);
  const [ loadingMore, setLoadingMore ] = useState(false);

  function handleEnvironmentButtonPressed(environment: string) {
    setEnvironmentActive(environment);

    if(environment === 'all') 
      return setFilteredPlants(plants);
    
    const filtered = plants.filter(plant => 
      plant.environments.includes(environment)
    );

    setFilteredPlants(filtered);
  }

  async function fetchPlants() {
    const { data } = await api.
      get(`/plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

    if(!data)
      return setLoading(true)

    if(page > 1) {
      setPlants(oldValue => [...oldValue, ...data]);
      setFilteredPlants(oldValue => [...oldValue, ...data]);
    } else {
      setPlants(data);
      setFilteredPlants(data);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleFetchMorePlants(distance: number) {
    if(distance < 1)
      return;

    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    fetchPlants();
  }

  useEffect(() => {

    async function fetchEnvironment() {
      const { data } = await api.
        get('/plants_environments?_sort=title&_order=asc');
      setEnvironments([
        {
          key: 'all',
          title: 'Todos',
        },
        ...data
      ]);
    }

    fetchEnvironment();

  }, [])

  useEffect(() => {
    fetchPlants();
  }, [])

  if(loading)
    return <Load />
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        <Text style={styles.title}>Em qual ambiente</Text>
        <Text style={styles.subtitle}>você quer colocar sua planta?</Text>
      </View>
      <View>
        <FlatList
          data={environments}
          keyExtractor={(item) => String(item.key)}
          renderItem={({ item }) => (
            <EnvironmentButton 
              key={item.key}
              title={item.title} 
              active={item.key === environmentActive}
              onPress={() => handleEnvironmentButtonPressed(item.key)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.environmentList}
        />
      </View>
      <View style={styles.plants}>
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlantCardPrimary data={item} />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          onEndReachedThreshold={0.1}
          onEndReached={({ distanceFromEnd }) => 
            handleFetchMorePlants(distanceFromEnd)
          }
          ListFooterComponent={
            loadingMore ? 
              <ActivityIndicator color={colors.green} /> 
              : <></>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  container: {
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15,
  },

  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading,
  },

  environmentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    paddingRight: 60,
    marginLeft: 32,
    marginVertical: 32,
  },

  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
});