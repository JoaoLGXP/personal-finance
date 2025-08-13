import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UpcomingBillsCard() {
  return (
    <View style={styles.infoCard}>
      <Ionicons name="information-circle-outline" size={24} color="#38015cff" />
      <Text style={styles.infoCardText}>
        Você possui contas recorrentes a vencer. Elas serão adicionadas aos gastos na virada do mês.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8d0f8ff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  infoCardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#38015cff',
    lineHeight: 20,
  },
});
