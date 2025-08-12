// src/components/DateFilter.js
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MonthPicker from 'react-native-month-year-picker';
import { useFinancial } from '../context/FinancialContext';

const DateFilter = () => {
  const { dateFilter, setDateFilter } = useFinancial();
  const [showPicker, setShowPicker] = useState(false);

  const showPickerModal = () => setShowPicker(true);

  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || new Date(dateFilter.year, dateFilter.month);
      setShowPicker(false);
      if (event === 'dateSetAction') {
        setDateFilter({
          month: selectedDate.getMonth(),
          year: selectedDate.getFullYear(),
        });
      }
    },
    [dateFilter, setDateFilter],
  );
  
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
    <View>
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color="#38015cff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={showPickerModal}>
            <Text style={styles.dateFilterText}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="#38015cff" />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <MonthPicker
          onChange={onValueChange}
          value={new Date(dateFilter.year, dateFilter.month)}
          minimumDate={new Date(2020, 0)}
          maximumDate={new Date(2030, 11)}
          locale="pt"
        />
      )}
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