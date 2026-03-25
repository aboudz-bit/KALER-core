import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../utils/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: Props) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>{children}</ScrollView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
