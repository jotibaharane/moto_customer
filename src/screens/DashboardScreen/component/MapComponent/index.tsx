import { RootState } from '@store/index';
import { GOOGLE_MAPS_API_KEY } from '@utils/env';
import { INDIA_DEFAULT_REGION } from '@utils/locationUtils';
import React, { FC, useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSelector } from 'react-redux';
import DropMarker from '../icon/DropMarker';
import OriginMarker from '../icon/OriginMarker';
import Truck from '../icon/Truck';
import { MAP_STYLE } from './helper';

const MapComponent: FC = () => {
  const mapRef = useRef<MapView>(null);
  const {
    map_state,
    selectedDriver,
    driverLocations,
    pickupLocation,
    destinationLocation,
  } = useSelector((state: RootState) => state.new);

  // AUTO FIT MAP TO DRIVER LOCATION
  useEffect(() => {
    if (!mapRef.current) return;

    const coordinates: { latitude: number; longitude: number }[] = [];
    if (pickupLocation?.latitude) {
      coordinates.push({
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
      });
    }
    // Driver location
    if (selectedDriver?.latitude && selectedDriver?.longitude) {
      coordinates.push({
        latitude: selectedDriver.latitude,
        longitude: selectedDriver.longitude,
      });
    }

    // Load nearby drivers
    if (driverLocations?.length) {
      driverLocations.forEach(item => {
        if (item?.latitude && item?.longitude) {
          coordinates.push({
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
          });
        }
      });
    }

    if (destinationLocation?.latitude && map_state !== 'process') {
      coordinates.push({
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      });
    }

    // Fit map only if we have at least one coordinate
    if (coordinates.length === 1) {
      // Single marker → normal zoom
      mapRef.current.animateCamera(
        {
          center: coordinates[0],
          zoom: 15,
        },
        { duration: 800 },
      );
    } else if (coordinates.length > 1) {
      // Multiple markers → fit all
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 80,
          right: 80,
          bottom: 200,
          left: 80,
        },
        animated: true,
      });
    }
  }, [selectedDriver, driverLocations, pickupLocation, destinationLocation]);

  return (
    <>
      <View style={{ flex: 1, position: 'relative' }}>
        <MapView
          ref={mapRef}
          initialRegion={INDIA_DEFAULT_REGION}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          mapType="standard"
          customMapStyle={MAP_STYLE}
          showsUserLocation={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          zoomEnabled
          zoomControlEnabled
          maxZoomLevel={18}
          minZoomLevel={4}
        >
          {selectedDriver?.latitude && (
            <Marker
              coordinate={selectedDriver || { latitude: 0, longitude: 0 }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
              tracksViewChanges={false}
              rotation={Number(selectedDriver.rotation)}
            >
              <Truck height={50} width={50} />
            </Marker>
          )}
          {pickupLocation?.latitude && (
            <Marker
              coordinate={{
                latitude: pickupLocation?.latitude! || 0,
                longitude: pickupLocation?.longitude! || 0,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
              tracksViewChanges={false}
            >
              <OriginMarker size={30} />
            </Marker>
          )}
          {map_state === 'pending' &&
            driverLocations?.map((item, index) => (
              <Marker
                coordinate={{
                  latitude: Number(item?.latitude) || 0,
                  longitude: Number(item?.longitude) || 0,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                tracksViewChanges={false}
                key={index}
              >
                {/* <Parcel height={50} width={50} /> */}
                <Truck height={50} width={50} />
              </Marker>
            ))}

          {destinationLocation?.latitude && (
            <Marker
              coordinate={{
                latitude: destinationLocation?.latitude! || 0,
                longitude: destinationLocation?.longitude! || 0,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
              tracksViewChanges={false}
            >
              <DropMarker size={20} />
            </Marker>
          )}
          {selectedDriver?.latitude &&
            map_state === 'process' &&
            pickupLocation?.latitude && (
              <MapViewDirections
                origin={{
                  latitude: selectedDriver?.latitude! || 0,
                  longitude: selectedDriver?.longitude! || 0,
                }}
                destination={{
                  latitude: pickupLocation?.latitude!,
                  longitude: pickupLocation?.longitude!,
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="hotpink"
              />
            )}

          {pickupLocation?.latitude &&
            map_state === 'active' &&
            destinationLocation?.latitude && (
              <MapViewDirections
                origin={{
                  latitude: pickupLocation?.latitude! || 0,
                  longitude: pickupLocation?.longitude! || 0,
                }}
                destination={{
                  latitude: destinationLocation?.latitude! || 0,
                  longitude: destinationLocation?.longitude! || 0,
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="hotpink"
              />
            )}
        </MapView>
      </View>
    </>
  );
};

export default MapComponent;
