// src/components/GestureContainer.js
import React from 'react';
import { View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useFinancial } from '../context/FinancialContext';

export default function GestureContainer({ children }) {
  const { dateFilter, setDateFilter } = useFinancial();

  const changeMonth = (amount) => {
    const newDate = new Date(dateFilter.year, dateFilter.month + amount);
    setDateFilter({
      month: newDate.getMonth(),
      year: newDate.getFullYear(),
    });
  };

  const onSwipeLeft = () => {
    changeMonth(1); // Avança um mês
  };

  const onSwipeRight = () => {
    changeMonth(-1); // Volta um mês
  };
  
  // O style {flex: 1} é crucial para que o detector de gestos ocupe a tela toda
  return (
    <GestureRecognizer
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      style={{ flex: 1 }}
    >
      {children}
    </GestureRecognizer>
  );
}