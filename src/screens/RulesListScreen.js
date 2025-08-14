// src/screens/RulesListScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { financialRules } from '../utils/financialRules';

export default function RulesListScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('RuleDetail', { rule: item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>Ver detalhes</Text>
        <Ionicons name="arrow-forward" size={16} color="#5a0394ff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={financialRules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  cardFooterText: { fontSize: 14, fontWeight: '600', color: '#5a0394ff', marginRight: 4 },
});