// src/screens/CategoriesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

// Paleta de cores para o seletor
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, removeCategory } = useFinancial();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentCategory({ name: '', color: COLORS[0] });
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!currentCategory.name) {
      Alert.alert('Erro', 'O nome da categoria é obrigatório.');
      return;
    }
    if (isEditing) {
      updateCategory(currentCategory.id, {
        name: currentCategory.name,
        color: currentCategory.color,
      });
    } else {
      addCategory({ name: currentCategory.name, color: currentCategory.color });
    }
    setModalVisible(false);
    setCurrentCategory(null);
  };

  const handleDelete = (category) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a categoria "${category.name}"? Todos os gastos associados a ela também serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => removeCategory(category.id), style: 'destructive' },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <View style={[styles.itemColor, { backgroundColor: item.color }]} />
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Nenhuma categoria encontrada</Text>
            <Text style={styles.emptyStateText}>Crie sua primeira categoria no botão +</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Categoria"
              value={currentCategory?.name}
              onChangeText={(text) => setCurrentCategory({ ...currentCategory, name: text })}
            />
            <Text style={styles.colorLabel}>Cor:</Text>
            <View style={styles.colorSelector}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentCategory?.color === color && styles.colorSelected,
                  ]}
                  onPress={() => setCurrentCategory({ ...currentCategory, color })}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos... (você pode copiar e colar a folha de estilos completa no final)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    itemInfo: { flexDirection: 'row', alignItems: 'center' },
    itemColor: { width: 20, height: 20, borderRadius: 10, marginRight: 16 },
    itemName: { fontSize: 16 },
    itemActions: { flexDirection: 'row' },
    actionButton: { padding: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', padding: 12, borderRadius: 8, marginBottom: 16 },
    colorLabel: { marginBottom: 8 },
    colorSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    colorOption: { width: 30, height: 30, borderRadius: 15 },
    colorSelected: { borderWidth: 3, borderColor: '#000' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelButton: { padding: 12 },
    saveButton: { padding: 12, backgroundColor: '#3B82F6', borderRadius: 8, marginLeft: 16 },
    saveButtonText: { color: '#fff' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});