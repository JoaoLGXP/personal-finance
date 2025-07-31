// src/screens/SuggestionsScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

export default function SuggestionsScreen() {
  const { getSuggestions, getFinancialAnalysis } = useFinancial();
  const suggestions = getSuggestions();
  const analysis = getFinancialAnalysis();

  const getIconName = (iconType) => {
    switch (iconType) {
      case 'warning': return 'warning';
      case 'alert-circle': return 'alert-circle';
      case 'trending-up': return 'trending-up';
      case 'checkmark-circle': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getCardStyle = (type) => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#F59E0B',
          iconColor: '#D97706'
        };
      case 'alert':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#EF4444',
          iconColor: '#DC2626'
        };
      case 'investment':
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#3B82F6',
          iconColor: '#2563EB'
        };
      case 'success':
        return {
          backgroundColor: '#D1FAE5',
          borderColor: '#10B981',
          iconColor: '#059669'
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          borderColor: '#6B7280',
          iconColor: '#4B5563'
        };
    }
  };

  const investmentOptions = [
    {
      title: 'Reserva de Emergência',
      description: 'Para cobrir 6-12 meses de gastos essenciais',
      risk: 'Baixo Risco',
      options: ['Poupança', 'CDB 100% CDI', 'Tesouro Selic'],
      icon: 'shield-checkmark'
    },
    {
      title: 'Renda Fixa',
      description: 'Para objetivos de médio prazo (1-5 anos)',
      risk: 'Baixo/Médio Risco',
      options: ['CDB', 'LCI/LCA', 'Tesouro Prefixado'],
      icon: 'trending-up'
    },
    {
      title: 'Renda Variável',
      description: 'Para crescimento de longo prazo (5+ anos)',
      risk: 'Médio/Alto Risco',
      options: ['Ações', 'ETFs', 'Fundos de Investimento'],
      icon: 'bar-chart'
    }
  ];

  const financialTips = [
    {
      title: 'Regra 50-30-20',
      description: '50% necessidades, 30% desejos, 20% poupança',
      icon: 'pie-chart'
    },
    {
      title: 'Controle de Gastos',
      description: 'Registre todos os gastos para ter visibilidade total',
      icon: 'list'
    },
    {
      title: 'Metas Financeiras',
      description: 'Defina objetivos claros para sua vida financeira',
      icon: 'flag'
    },
    {
      title: 'Educação Financeira',
      description: 'Invista tempo aprendendo sobre finanças pessoais',
      icon: 'school'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const openInvestmentLink = () => {
    Linking.openURL('https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color="#3B82F6" />
        <Text style={styles.headerTitle}>Sugestões Personalizadas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Análise da Sua Situação</Text>
        {suggestions.map((suggestion, index) => {
          const cardStyle = getCardStyle(suggestion.type);
          return (
            <View
              key={index}
              style={[
                styles.suggestionCard,
                {
                  backgroundColor: cardStyle.backgroundColor,
                  borderLeftColor: cardStyle.borderColor
                }
              ]}
            >
              <View style={styles.suggestionHeader}>
                <Ionicons
                  name={getIconName(suggestion.icon)}
                  size={24}
                  color={cardStyle.iconColor}
                />
                <Text style={[styles.suggestionTitle, { color: cardStyle.iconColor }]}>
                  {suggestion.title}
                </Text>
              </View>
              <Text style={styles.suggestionMessage}>{suggestion.message}</Text>
            </View>
          );
        })}
      </View>

      {analysis.remaining > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Onde Investir</Text>
          <Text style={styles.sectionSubtitle}>
            Você tem {formatCurrency(analysis.remaining)} disponível para investir
          </Text>
          
          {investmentOptions.map((investment, index) => (
            <View key={index} style={styles.investmentCard}>
              <View style={styles.investmentHeader}>
                <Ionicons name={investment.icon} size={24} color="#3B82F6" />
                <View style={styles.investmentTitleContainer}>
                  <Text style={styles.investmentTitle}>{investment.title}</Text>
                  <Text style={styles.investmentRisk}>{investment.risk}</Text>
                </View>
              </View>
              <Text style={styles.investmentDescription}>{investment.description}</Text>
              <View style={styles.investmentOptions}>
                {investment.options.map((option, optionIndex) => (
                  <View key={optionIndex} style={styles.investmentOption}>
                    <Text style={styles.investmentOptionText}>• {option}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.learnMoreButton} onPress={openInvestmentLink}>
            <Text style={styles.learnMoreText}>Saiba Mais Sobre Investimentos</Text>
            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Dicas Financeiras</Text>
        {financialTips.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon} size={20} color="#3B82F6" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {analysis.salary > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Distribuição Ideal</Text>
          <View style={styles.budgetCard}>
            <Text style={styles.budgetTitle}>
              Baseado na sua renda de {formatCurrency(analysis.salary)}
            </Text>
            
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Necessidades (50%)</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(analysis.salary * 0.5)}
              </Text>
            </View>
            
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Desejos (30%)</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(analysis.salary * 0.3)}
              </Text>
            </View>
            
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Poupança/Investimentos (20%)</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(analysis.salary * 0.2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {analysis.totalExpenses > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Reserva de Emergência</Text>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Meta Recomendada</Text>
            <Text style={styles.emergencyAmount}>
              {formatCurrency(analysis.totalExpenses * 6)} - {formatCurrency(analysis.totalExpenses * 12)}
            </Text>
            <Text style={styles.emergencyDescription}>
              Entre 6 e 12 meses dos seus gastos mensais ({formatCurrency(analysis.totalExpenses)})
            </Text>
            
            {analysis.remaining > 0 && (
              <View style={styles.emergencyProgress}>
                <Text style={styles.emergencyProgressText}>
                  Com sua sobra atual de {formatCurrency(analysis.remaining)} por mês, 
                  você levaria {Math.ceil((analysis.totalExpenses * 6) / analysis.remaining)} meses 
                  para formar a reserva mínima.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  suggestionMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  investmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  investmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  investmentTitleContainer: {
    marginLeft: 12,
  },
  investmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  investmentRisk: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  investmentDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  investmentOptions: {
    marginLeft: 12,
  },
  investmentOption: {
    marginBottom: 4,
  },
  investmentOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 8,
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  budgetCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emergencyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencyAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emergencyProgress: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
  },
  emergencyProgressText: {
    fontSize: 14,
    color: '#0369A1',
    textAlign: 'center',
    lineHeight: 18,
  },
});