// App.js
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Drawer from 'react-native-drawer';

import DashboardScreen from './src/screens/DashboardScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import RecurringScreen from './src/screens/RecurringScreen';
import { FinancialProvider } from './src/context/FinancialContext';
import SideMenu from './src/components/SideMenu';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegador principal com as abas
function TabNavigator({ openDrawer }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          else if (route.name === 'Gastos') iconName = focused ? 'receipt' : 'receipt-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#3B82F6' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        // Botão de menu no cabeçalho
        headerLeft: () => (
          <TouchableOpacity onPress={openDrawer} style={{ marginLeft: 15 }}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Painel Financeiro' }} />
      <Tab.Screen name="Gastos" component={ExpensesScreen} options={{ title: 'Meus Gastos' }} />
    </Tab.Navigator>
  );
}

// Stack Navigator para empilhar todas as telas
function AppNavigator({ openDrawer }) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                {() => <TabNavigator openDrawer={openDrawer} />}
            </Stack.Screen>
            {/* Telas que serão abertas pelo menu */}
            <Stack.Screen name="Recorrências" component={RecurringScreen} options={{ title: 'Transações Recorrentes', headerStyle: { backgroundColor: '#3B82F6' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Categorias" component={CategoriesScreen} options={{ title: 'Minhas Categorias', headerStyle: { backgroundColor: '#3B82F6' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Sugestões" component={SuggestionsScreen} options={{ title: 'Dicas Financeiras', headerStyle: { backgroundColor: '#3B82F6' }, headerTintColor: '#fff' }} />
        </Stack.Navigator>
    );
}


export default function App() {
  const drawerRef = useRef(null);

  const closeDrawer = () => {
    drawerRef.current.close();
  };

  const openDrawer = () => {
    drawerRef.current.open();
  };

  return (
    <FinancialProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Drawer
          ref={drawerRef}
          type="overlay"
          content={<SideMenu navigation={{ navigate: (screen) => {/* Lógica de navegação será tratada no Stack */} }} closeDrawer={closeDrawer} />}
          tapToClose={true}
          openDrawerOffset={0.2} // 20% da tela fica visível
          panCloseMask={0.2}
          closedDrawerOffset={-3}
          styles={{
            drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3 },
            main: { paddingLeft: 3 },
          }}
          tweenHandler={(ratio) => ({
            main: { opacity: (2 - ratio) / 2 },
          })}
        >
         <AppNavigator openDrawer={openDrawer} />
        </Drawer>
      </NavigationContainer>
    </FinancialProvider>
  );
}