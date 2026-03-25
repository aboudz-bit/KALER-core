import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useZones } from '../../src/hooks/queries/useZones';
import { useLocations } from '../../src/hooks/queries/useLocations';
import { useUsers } from '../../src/hooks/queries/useUsers';
import { useGPS } from '../../src/hooks/useGPS';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import { useCreateZone, useCreateLocation } from '../../src/hooks/mutations/useCreateZone';
import { Modal } from '../../src/components/ui/Modal';
import { Button } from '../../src/components/ui/Button';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { colors } from '../../src/utils/colors';
import { hasPermission, polygonCentroid } from '@kaler/shared';
import type { Coordinate } from '@kaler/shared';

const KHURAIS_REGION = {
  latitude: 25.085,
  longitude: 48.16,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

type MapMode = 'view' | 'draw_zone' | 'place_location';

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { data: zones } = useZones();
  const { data: locations } = useLocations();
  const { data: users } = useUsers();
  const gps = useGPS();
  const { isActive: isEmergency } = useEmergency();
  const { user } = useAuth();
  const createZone = useCreateZone();
  const createLocation = useCreateLocation();

  const [mode, setMode] = useState<MapMode>('view');
  const [drawPoints, setDrawPoints] = useState<Coordinate[]>([]);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newLocationCoord, setNewLocationCoord] = useState<Coordinate | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const canEdit = user && hasPermission(user.role as any, 'eco');

  const handleMapPress = useCallback(
    (e: any) => {
      const coord = e.nativeEvent.coordinate;
      if (mode === 'draw_zone') {
        setDrawPoints((prev) => [
          ...prev,
          { latitude: coord.latitude, longitude: coord.longitude },
        ]);
      } else if (mode === 'place_location') {
        setNewLocationCoord({
          latitude: coord.latitude,
          longitude: coord.longitude,
        });
        setShowLocationForm(true);
        setMode('view');
      }
    },
    [mode]
  );

  const handleFinishZone = () => {
    if (drawPoints.length < 3) {
      Alert.alert('Error', 'A zone needs at least 3 points');
      return;
    }
    setShowZoneForm(true);
  };

  const handleSaveZone = async () => {
    if (!zoneName.trim()) {
      Alert.alert('Error', 'Zone name required');
      return;
    }
    try {
      await createZone.mutateAsync({
        name: zoneName.trim(),
        polygon: drawPoints,
      });
      setDrawPoints([]);
      setMode('view');
      setShowZoneForm(false);
      setZoneName('');
    } catch {
      Alert.alert('Error', 'Failed to create zone');
    }
  };

  const handleSaveLocation = async () => {
    if (!locationName.trim() || !selectedZoneId || !newLocationCoord) {
      Alert.alert('Error', 'Name and zone required');
      return;
    }
    try {
      await createLocation.mutateAsync({
        name: locationName.trim(),
        zoneId: selectedZoneId,
        coordinates: newLocationCoord,
      });
      setShowLocationForm(false);
      setLocationName('');
      setSelectedZoneId('');
      setNewLocationCoord(null);
    } catch {
      Alert.alert('Error', 'Failed to create location');
    }
  };

  const centerOnUser = () => {
    if (gps.latitude && gps.longitude) {
      mapRef.current?.animateToRegion({
        latitude: gps.latitude,
        longitude: gps.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={KHURAIS_REGION}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Zone Polygons */}
        {zones?.map((zone: any) => {
          const polygon = zone.polygon as Coordinate[];
          return (
            <React.Fragment key={zone.id}>
              <Polygon
                coordinates={polygon}
                fillColor={`${zone.color}30`}
                strokeColor={zone.color}
                strokeWidth={2}
              />
              <Marker
                coordinate={polygonCentroid(polygon)}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.zoneLabel}>
                  <Text style={styles.zoneLabelText}>{zone.name}</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Drawing polygon */}
        {drawPoints.length >= 3 && (
          <Polygon
            coordinates={drawPoints}
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor={colors.secondary}
            strokeWidth={2}
            lineDashPattern={[5, 5]}
          />
        )}
        {drawPoints.map((pt, i) => (
          <Marker
            key={`draw-${i}`}
            coordinate={pt}
            pinColor={colors.secondary}
          />
        ))}

        {/* Location Markers */}
        {locations?.map((loc: any) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.description}
            pinColor={colors.primary}
          />
        ))}

        {/* Personnel markers during emergency */}
        {isEmergency &&
          users
            ?.filter(
              (u: any) => u.currentLatitude != null && u.currentLongitude != null
            )
            .map((u: any) => (
              <Marker
                key={`user-${u.id}`}
                coordinate={{
                  latitude: u.currentLatitude,
                  longitude: u.currentLongitude,
                }}
                title={u.name}
                description={`${u.badgeNumber} - ${u.responseStatus}`}
              >
                <View
                  style={[
                    styles.personnelMarker,
                    {
                      backgroundColor:
                        colors.status[
                          u.responseStatus as keyof typeof colors.status
                        ] || colors.gray[400],
                    },
                  ]}
                >
                  <Text style={styles.personnelMarkerText}>
                    {u.name.charAt(0)}
                  </Text>
                </View>
              </Marker>
            ))}

        {/* New location placement marker */}
        {newLocationCoord && (
          <Marker coordinate={newLocationCoord} pinColor={colors.success} />
        )}
      </MapView>

      {/* Controls Overlay */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={centerOnUser}>
          <Text style={styles.controlBtnText}>GPS</Text>
        </TouchableOpacity>

        {canEdit && mode === 'view' && (
          <>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setMode('draw_zone')}
            >
              <Text style={styles.controlBtnText}>Draw Zone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.success }]}
              onPress={() => setMode('place_location')}
            >
              <Text style={styles.controlBtnText}>Add Location</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'draw_zone' && (
          <>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.warning }]}
              onPress={handleFinishZone}
            >
              <Text style={styles.controlBtnText}>
                Done ({drawPoints.length} pts)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.danger }]}
              onPress={() => {
                setDrawPoints([]);
                setMode('view');
              }}
            >
              <Text style={styles.controlBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'place_location' && (
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.danger }]}
            onPress={() => setMode('view')}
          >
            <Text style={styles.controlBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mode indicator */}
      {mode !== 'view' && (
        <View style={styles.modeBar}>
          <Text style={styles.modeBarText}>
            {mode === 'draw_zone'
              ? 'Tap map to draw zone polygon'
              : 'Tap map to place location'}
          </Text>
        </View>
      )}

      {/* Legend */}
      {isEmergency && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Status</Text>
          {['safe', 'pending', 'need_help', 'no_reply'].map((s) => (
            <StatusIndicator key={s} status={s} size="small" />
          ))}
        </View>
      )}

      {/* Zone Name Modal */}
      <Modal
        visible={showZoneForm}
        onClose={() => setShowZoneForm(false)}
        title="Name New Zone"
      >
        <View style={{ padding: 4 }}>
          <Text style={styles.formLabel}>Zone Name</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputInner}>
              <Text style={styles.inputText}>
                {zoneName || 'Enter zone name...'}
              </Text>
            </View>
          </View>
          <View style={styles.textInputContainer}>
            <View style={styles.textInput}>
              <Text
                style={{ color: colors.gray[500], fontSize: 12, marginBottom: 4 }}
              >
                Type name:
              </Text>
              {/* Using a simple approach for name input */}
              <View style={styles.inputRow}>
                {['CPF', 'Camp', 'Gas Train', 'OT-'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={styles.presetBtn}
                    onPress={() => setZoneName(preset)}
                  >
                    <Text style={styles.presetText}>{preset}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <Button
            title="Create Zone"
            onPress={handleSaveZone}
            loading={createZone.isPending}
            style={{ marginTop: 16 }}
          />
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationForm}
        onClose={() => {
          setShowLocationForm(false);
          setNewLocationCoord(null);
        }}
        title="New Location"
      >
        <View style={{ padding: 4 }}>
          <Text style={styles.formLabel}>Location Name</Text>
          <View style={styles.inputRow}>
            {['CCR', 'Workshop', 'Gate', 'Shelter'].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetBtn,
                  locationName === preset && styles.presetBtnActive,
                ]}
                onPress={() => setLocationName(preset)}
              >
                <Text
                  style={[
                    styles.presetText,
                    locationName === preset && styles.presetTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Zone</Text>
          <View style={styles.inputRow}>
            {zones?.map((zone: any) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.presetBtn,
                  selectedZoneId === zone.id && {
                    backgroundColor: zone.color,
                  },
                ]}
                onPress={() => setSelectedZoneId(zone.id)}
              >
                <Text
                  style={[
                    styles.presetText,
                    selectedZoneId === zone.id && { color: colors.white },
                  ]}
                >
                  {zone.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {newLocationCoord && (
            <Text style={styles.coordText}>
              Lat: {newLocationCoord.latitude.toFixed(6)}, Lng:{' '}
              {newLocationCoord.longitude.toFixed(6)}
            </Text>
          )}

          <Button
            title="Create Location"
            onPress={handleSaveLocation}
            loading={createLocation.isPending}
            style={{ marginTop: 16 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  controlBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  controlBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  modeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.secondary,
    padding: 10,
    alignItems: 'center',
  },
  modeBarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray[500],
    marginBottom: 4,
  },
  zoneLabel: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  zoneLabelText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  personnelMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  personnelMarkerText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrap: {
    marginBottom: 8,
  },
  inputInner: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
  },
  inputText: {
    fontSize: 15,
    color: colors.gray[800],
  },
  textInputContainer: {},
  textInput: {},
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  presetTextActive: {
    color: colors.white,
  },
  coordText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
  },
});
