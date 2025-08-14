// src/components/RulesHighlightCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RulesHighlightCard() {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="book-outline" size={24} color="#5a0394ff" />
        <Text style={styles.title}>Aprenda a Organizar seus Gastos</Text>
      </View>
      <Text style={styles.description}>
        Conheça métodos como a Regra 50-30-20 para equilibrar suas finanças e atingir seus objetivos.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Regras de Gastos')}
      >
        <Text style={styles.buttonText}>Ver Regras</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginLeft: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  button: { backgroundColor: '#e8d0f8ff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#5a0394ff', fontWeight: 'bold', fontSize: 14 },
});