// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import OnboardingScreen from './src/screens/OnboardingScreen'; // NOVO
import DashboardScreen from './src/screens/DashboardScreen';
import IncomesScreen from './src/screens/IncomesScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import RecurringScreen from './src/screens/RecurringScreen';
import RulesListScreen from './src/screens/RulesListScreen';
import RuleDetailScreen from './src/screens/RuleDetailScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';

import { FinancialProvider, useFinancial } from './src/context/FinancialContext';
import { DrawerContent } from './src/components/DrawerContent';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#5a0394ff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: '#5a0394ff',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
      }}
    >
      <Drawer.Screen name="Painel Financeiro" component={DashboardScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="pie-chart-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Análise de Gastos" component={AnalysisScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="analytics-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Minhas Receitas" component={IncomesScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="cash-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Meus Gastos" component={ExpensesScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="receipt-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Transações Recorrentes" component={RecurringScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="repeat-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Minhas Categorias" component={CategoriesScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="pricetags-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Regras de Gastos" component={RulesListScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="book-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Dicas Financeiras" component={SuggestionsScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="bulb-outline" size={22} color={color} /> }} />
    </Drawer.Navigator>
  );
}

// NOVO: Componente que decide qual tela mostrar
function AppNavigator() {
    const { hasOnboarded, isLoading } = useFinancial();

    if (isLoading) {
        // Pode-se adicionar uma tela de splash aqui, se desejar
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!hasOnboarded ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
                <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
            )}
            <Stack.Screen 
                name="RuleDetail" 
                component={RuleDetailScreen} 
                options={{ 
                    headerShown: true,
                    title: 'Detalhes da Regra',
                    headerStyle: { backgroundColor: '#5a0394ff' },
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    );
}

export default function App() {
  return (
    <FinancialProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </FinancialProvider>
  );
}