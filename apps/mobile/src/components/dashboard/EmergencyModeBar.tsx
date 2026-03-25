import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmergency } from '../../providers/EmergencyProvider';
import { colors } from '../../utils/colors';
import { haptic } from '../../utils/haptics';

interface Props {
  onDeactivate?: () => void;
  canDeactivate?: boolean;
  deactivating?: boolean;
}

export function EmergencyModeBar({ onDeactivate, canDeactivate, deactivating }: Props) {
  const { isActive, mode } = useEmergency();

  if (!isActive) return null;

  const modeLabel = mode === 'shelter_in' ? 'SHELTER IN PLACE' : 'BLACKOUT MODE';
  const bgColor =
    mode === 'blackout' ? colors.emergency.blackout : colors.emergency.shelter_in;
  const icon: keyof typeof Ionicons.glyphMap =
    mode === 'blackout' ? 'moon' : 'shield';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.left}>
        <Ionicons name={icon} size={24} color={colors.white} />
        <View style={styles.textWrap}>
          <Text style={styles.label}>ACTIVE EMERGENCY</Text>
          <Text style={styles.mode}>{modeLabel}</Text>
        </View>
      </View>
      {canDeactivate && onDeactivate && (
        <Pressable
          onPress={() => {
            if (deactivating) return;
            haptic.heavy();
            onDeactivate();
          }}
          disabled={deactivating}
          style={({ pressed }) => [
            styles.deactivateBtn,
            { opacity: deactivating ? 0.5 : pressed ? 0.7 : 1 },
          ]}
        >
          {deactivating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="power" size={16} color={colors.white} />
              <Text style={styles.deactivateText}>END</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  mode: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  deactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deactivateText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
