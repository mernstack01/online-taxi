import * as Location from 'expo-location';

export type Coordinates = {
  lat: number;
  lng: number;
};

export const getCurrentUserLocation = async (): Promise<Coordinates> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
};
