// src/screens/OnboardingScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFinancial } from '../context/FinancialContext';

// Você precisará de 3 imagens. Coloque-as na sua pasta `assets`.
// Por enquanto, usaremos placeholders.
const onboardingImage1 = require('../../assets/onboarding1.png');
const onboardingImage2 = require('../../assets/onboarding2.png');
const onboardingImage3 = require('../../assets/onboarding3.png');

const onboardingPages = [
  {
    key: '1',
    title: 'Bem-vindo ao SaldoUp!',
    description: 'Seu novo aliado para uma vida financeira organizada e sem estresse.',
    image: onboardingImage1,
  },
  {
    key: '2',
    title: 'Visualize Seus Gastos',
    description: 'Registre suas receitas e despesas e veja para onde seu dinheiro está indo com nossos gráficos inteligentes.',
    image: onboardingImage2,
  },
  {
    key: '3',
    title: 'Planeje Seu Futuro',
    description: 'Com previsões e análises, o SaldoUp te ajuda a atingir seus objetivos financeiros.',
    image: onboardingImage3,
  },
];

export default function OnboardingScreen() {
  const { setOnboarded } = useFinancial();

  return (
    <SafeAreaView style={styles.container}>
      <PagerView style={styles.pagerView} initialPage={0}>
        {onboardingPages.map(page => (
          <View key={page.key} style={styles.page}>
            <Image source={page.image} style={styles.image} />
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        ))}
      </PagerView>
      <TouchableOpacity style={styles.button} onPress={setOnboarded}>
        <Text style={styles.buttonText}>Começar Agora</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  pagerView: { flex: 1 },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#5a0394ff',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});