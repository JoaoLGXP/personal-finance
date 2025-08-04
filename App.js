// App.js
import 'react-native-gesture-handler'; // IMPORTANTE: Deve ser a primeira linha
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import RecurringScreen from './src/screens/RecurringScreen';
import { FinancialProvider } from './src/context/FinancialContext';
import { DrawerContent } from './src/components/DrawerContent'; // Usaremos o mesmo menu customizado

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <FinancialProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={props => <DrawerContent {...props} />}
          screenOptions={{
            headerStyle: { backgroundColor: '#3B82F6' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            drawerActiveBackgroundColor: '#3B82F6',
            drawerActiveTintColor: '#fff',
            drawerInactiveTintColor: '#333',
            drawerLabelStyle: { marginLeft: -20, fontSize: 15 }
          }}
        >
          <Drawer.Screen
            name="Painel Financeiro"
            component={DashboardScreen}
            options={{ drawerIcon: ({ color }) => <Ionicons name="pie-chart-outline" size={22} color={color} /> }}
          />
          <Drawer.Screen
            name="Meus Gastos"
            component={ExpensesScreen}
            options={{ drawerIcon: ({ color }) => <Ionicons name="receipt-outline" size={22} color={color} /> }}
          />
          <Drawer.Screen
            name="Transações Recorrentes"
            component={RecurringScreen}
            options={{ drawerIcon: ({ color }) => <Ionicons name="repeat-outline" size={22} color={color} /> }}
          />
          <Drawer.Screen
            name="Minhas Categorias"
            component={CategoriesScreen}
            options={{ drawerIcon: ({ color }) => <Ionicons name="pricetags-outline" size={22} color={color} /> }}
          />
          <Drawer.Screen
            name="Dicas Financeiras"
            component={SuggestionsScreen}
            options={{ drawerIcon: ({ color }) => <Ionicons name="bulb-outline" size={22} color={color} /> }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </FinancialProvider>
  );
}