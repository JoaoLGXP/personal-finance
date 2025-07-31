// src/components/SideMenu.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// O menu recebe a navegação e uma função para fechar a si mesmo
export default function SideMenu({ navigation, closeDrawer }) {
  const navigateTo = (screen) => {
    navigation.navigate(screen);
    closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={40} color="#3B82F6" />
        <Text style={styles.headerTitle}>Meu App Financeiro</Text>
      </View>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Recorrências')}>
        <Ionicons name="repeat-outline" size={22} color="#333" />
        <Text style={styles.menuText}>Transações Recorrentes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Categorias')}>
        <Ionicons name="pricetags-outline" size={22} color="#333" />
        <Text style={styles.menuText}>Minhas Categorias</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Sugestões')}>
        <Ionicons name="bulb-outline" size={22} color="#333" />
        <Text style={styles.menuText}>Dicas Financeiras</Text>
      </TouchableOpacity>
      {/* Aqui você pode adicionar "Configurações" no futuro */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
});