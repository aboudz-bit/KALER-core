import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useZones } from '../../src/hooks/queries/useZones';
import { useLocations } from '../../src/hooks/queries/useLocations';
import { useUsers } from '../../src/hooks/queries/useUsers';
import { useGPS } from '../../src/hooks/useGPS';
import { useEmergency } from '../../src/providers/EmergencyProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useCreateZone,
  useCreateLocation,
} from '../../src/hooks/mutations/useCreateZone';
import { Modal } from '../../src/components/ui/Modal';
import { Button } from '../../src/components/ui/Button';
import { FormField } from '../../src/components/ui/FormField';
import { ChipSelect } from '../../src/components/ui/ChipSelect';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { colors } from '../../src/utils/colors';
import { haptic } from '../../src/utils/haptics';
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
  const insets = useSafeAreaInsets();
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
  const [newLocationCoord, setNewLocationCoord] = useState<Coordinate | null>(
    null
  );
  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  const canEdit = user && hasPermission(user.role as any, 'eco');

  const handleMapPress = useCallback(
    (e: any) => {
      const coord = e.nativeEvent.coordinate;
      if (mode === 'draw_zone') {
        haptic.light();
        setDrawPoints((prev) => [
          ...prev,
          { latitude: coord.latitude, longitude: coord.longitude },
        ]);
      } else if (mode === 'place_location') {
        haptic.medium();
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
      haptic.error();
      Alert.alert('Not Enough Points', 'A zone needs at least 3 points. Keep tapping the map.');
      return;
    }
    haptic.success();
    setShowZoneForm(true);
  };

  const handleUndoPoint = () => {
    haptic.light();
    setDrawPoints((prev) => prev.slice(0, -1));
  };

  const handleSaveZone = async () => {
    if (!zoneName.trim()) {
      haptic.error();
      Alert.alert('Error', 'Zone name is required');
      return;
    }
    try {
      await createZone.mutateAsync({
        name: zoneName.trim(),
        description: zoneDescription.trim() || undefined,
        polygon: drawPoints,
      });
      haptic.success();
      setDrawPoints([]);
      setMode('view');
      setShowZoneForm(false);
      setZoneName('');
      setZoneDescription('');
    } catch {
      haptic.error();
      Alert.alert('Error', 'Failed to create zone');
    }
  };

  const handleSaveLocation = async () => {
    if (!locationName.trim() || !selectedZoneId || !newLocationCoord) {
      haptic.error();
      Alert.alert('Error', 'Name and zone are required');
      return;
    }
    try {
      await createLocation.mutateAsync({
        name: locationName.trim(),
        description: locationDescription.trim() || undefined,
        zoneId: selectedZoneId,
        coordinates: newLocationCoord,
      });
      haptic.success();
      setShowLocationForm(false);
      setLocationName('');
      setLocationDescription('');
      setSelectedZoneId('');
      setNewLocationCoord(null);
    } catch {
      haptic.error();
      Alert.alert('Error', 'Failed to create location');
    }
  };

  const centerOnUser = () => {
    haptic.light();
    if (gps.latitude && gps.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: gps.latitude,
          longitude: gps.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
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
        showsCompass
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {/* Zone Polygons */}
        {zones?.map((zone: any) => {
          const polygon = zone.polygon as Coordinate[];
          return (
            <React.Fragment key={zone.id}>
              <Polygon
                coordinates={polygon}
                fillColor={`${zone.color}25`}
                strokeColor={zone.color}
                strokeWidth={2}
              />
              <Marker
                coordinate={polygonCentroid(polygon)}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <View style={[styles.zoneLabel, { backgroundColor: zone.color }]}>
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
            fillColor="rgba(59, 130, 246, 0.15)"
            strokeColor={colors.secondary}
            strokeWidth={2.5}
            lineDashPattern={[8, 4]}
          />
        )}
        {drawPoints.map((pt, i) => (
          <Marker
            key={`draw-${i}`}
            coordinate={pt}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.drawDot}>
              <Text style={styles.drawDotText}>{i + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* Location Markers */}
        {locations?.map((loc: any) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.description}
            tracksViewChanges={false}
          >
            <View style={styles.locationMarker}>
              <Ionicons name="location" size={24} color={colors.primary} />
            </View>
          </Marker>
        ))}

        {/* Personnel markers during emergency */}
        {isEmergency &&
          users
            ?.filter(
              (u: any) =>
                u.currentLatitude != null && u.currentLongitude != null
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
                tracksViewChanges={false}
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
          <Marker coordinate={newLocationCoord}>
            <Ionicons name="pin" size={36} color={colors.success} />
          </Marker>
        )}
      </MapView>

      {/* Mode indicator bar */}
      {mode !== 'view' && (
        <View style={[styles.modeBar, { paddingTop: insets.top + 8 }]}>
          <Ionicons
            name={mode === 'draw_zone' ? 'create' : 'pin'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.modeBarText}>
            {mode === 'draw_zone'
              ? `Tap to draw polygon (${drawPoints.length} points)`
              : 'Tap map to place location'}
          </Text>
        </View>
      )}

      {/* FAB Controls */}
      <View style={[styles.fabColumn, { bottom: insets.bottom + 20 }]}>
        {/* GPS center button */}
        <FABButton
          icon="navigate"
          onPress={centerOnUser}
          color={colors.primary}
        />

        {canEdit && mode === 'view' && (
          <>
            <FABButton
              icon="create-outline"
              onPress={() => {
                haptic.medium();
                setMode('draw_zone');
              }}
              color={colors.secondary}
              label="Zone"
            />
            <FABButton
              icon="pin-outline"
              onPress={() => {
                haptic.medium();
                setMode('place_location');
              }}
              color={colors.success}
              label="Location"
            />
          </>
        )}

        {mode === 'draw_zone' && (
          <>
            {drawPoints.length > 0 && (
              <FABButton
                icon="arrow-undo"
                onPress={handleUndoPoint}
                color={colors.warning}
                label="Undo"
              />
            )}
            <FABButton
              icon="checkmark-circle"
              onPress={handleFinishZone}
              color={colors.success}
              label="Done"
            />
            <FABButton
              icon="close-circle"
              onPress={() => {
                haptic.light();
                setDrawPoints([]);
                setMode('view');
              }}
              color={colors.danger}
              label="Cancel"
            />
          </>
        )}

        {mode === 'place_location' && (
          <FABButton
            icon="close-circle"
            onPress={() => {
              haptic.light();
              setMode('view');
            }}
            color={colors.danger}
            label="Cancel"
          />
        )}
      </View>

      {/* Legend during emergency */}
      {isEmergency && (
        <View style={[styles.legend, { top: insets.top + 60 }]}>
          <Text style={styles.legendTitle}>PERSONNEL STATUS</Text>
          {['safe', 'pending', 'need_help', 'no_reply'].map((s) => (
            <StatusIndicator key={s} status={s} size="small" />
          ))}
        </View>
      )}

      {/* Zone Name Modal */}
      <Modal
        visible={showZoneForm}
        onClose={() => setShowZoneForm(false)}
        title="Create Zone"
      >
        <FormField
          label="Zone Name"
          value={zoneName}
          onChangeText={setZoneName}
          placeholder="e.g. CPF, Camp, Gas Train-1"
          autoFocus
        />
        <FormField
          label="Description (optional)"
          value={zoneDescription}
          onChangeText={setZoneDescription}
          placeholder="Brief description of this zone"
        />
        <Text style={styles.coordInfo}>
          {drawPoints.length} polygon points drawn
        </Text>
        <Button
          title="Create Zone"
          onPress={handleSaveZone}
          loading={createZone.isPending}
          icon={<Ionicons name="checkmark" size={20} color={colors.white} />}
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationForm}
        onClose={() => {
          setShowLocationForm(false);
          setNewLocationCoord(null);
        }}
        title="Create Location"
      >
        <FormField
          label="Location Name"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="e.g. CCR, Workshop, Gate-1"
          autoFocus
        />
        <FormField
          label="Description (optional)"
          value={locationDescription}
          onChangeText={setLocationDescription}
          placeholder="Brief description"
        />

        <Text style={styles.formLabel}>Assign to Zone</Text>
        {zones && zones.length > 0 ? (
          <ChipSelect
            chips={zones.map((z: any) => ({
              value: z.id,
              label: z.name,
              color: z.color,
            }))}
            selected={selectedZoneId}
            onChange={setSelectedZoneId}
          />
        ) : (
          <Text style={styles.noZonesText}>No zones available. Create a zone first.</Text>
        )}

        {newLocationCoord && (
          <View style={styles.coordBox}>
            <Ionicons name="navigate" size={16} color={colors.gray[400]} />
            <Text style={styles.coordText}>
              {newLocationCoord.latitude.toFixed(6)},{' '}
              {newLocationCoord.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        <Button
          title="Create Location"
          onPress={handleSaveLocation}
          loading={createLocation.isPending}
          icon={<Ionicons name="pin" size={20} color={colors.white} />}
          style={{ marginTop: 20 }}
        />
      </Modal>
    </View>
  );
}

function FABButton({
  icon,
  onPress,
  color,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        fabStyles.button,
        { backgroundColor: color },
        label ? fabStyles.extended : fabStyles.circle,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.white} />
      {label && <Text style={fabStyles.label}>{label}</Text>}
    </Pressable>
  );
}

const fabStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  extended: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
  },
  label: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  modeBarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  fabColumn: {
    position: 'absolute',
    right: 16,
    gap: 10,
    alignItems: 'flex-end',
  },
  legend: {
    position: 'absolute',
    left: 16,
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[500],
    letterSpacing: 1,
    marginBottom: 2,
  },
  zoneLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneLabelText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  drawDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawDotText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  locationMarker: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  personnelMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  personnelMarkerText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[700],
    marginBottom: 8,
  },
  coordInfo: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
  coordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  coordText: {
    fontSize: 13,
    color: colors.gray[600],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  noZonesText: {
    fontSize: 13,
    color: colors.gray[400],
    fontStyle: 'italic',
  },
});
