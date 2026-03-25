import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEmergency } from '../../providers/EmergencyProvider';
import { colors } from '../../utils/colors';

interface Props {
  onDeactivate?: () => void;
  canDeactivate?: boolean;
}

export function EmergencyModeBar({ onDeactivate, canDeactivate }: Props) {
  const { isActive, mode } = useEmergency();

  if (!isActive) return null;

  const modeLabel = mode === 'shelter_in' ? 'SHELTER IN PLACE' : 'BLACKOUT MODE';
  const bgColor = mode === 'blackout' ? colors.emergency.blackout : colors.emergency.shelter_in;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View>
        <Text style={styles.label}>ACTIVE EMERGENCY</Text>
        <Text style={styles.mode}>{modeLabel}</Text>
      </View>
      {canDeactivate && onDeactivate && (
        <TouchableOpacity onPress={onDeactivate} style={styles.deactivateBtn}>
          <Text style={styles.deactivateText}>DEACTIVATE</Text>
        </TouchableOpacity>
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
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mode: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  deactivateBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  deactivateText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
});
