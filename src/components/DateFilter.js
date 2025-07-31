// src/components/DateFilter.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

const DateFilter = () => {
  const { dateFilter, setDateFilter } = useFinancial();

  const changeMonth = (amount) => {
    const newDate = new Date(dateFilter.year, dateFilter.month + amount);
    setDateFilter({
      month: newDate.getMonth(),
      year: newDate.getFullYear(),
    });
  };

  const monthName = new Date(dateFilter.year, dateFilter.month).toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.dateFilterContainer}>
      {true ? (
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
      ) : null}

      {true ? (
        <Text style={styles.dateFilterText}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
      ) : null}

      {true ? (
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  arrowButton: {
    padding: 4,
  },
});

export default DateFilter;
