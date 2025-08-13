import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryPickerModal({
  visible,
  setVisible,
  categories,
  setNewTransaction,
  newTransaction,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Categoria</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {Array.isArray(categories) && (
            <FlatList
              data={categories.filter(c => c && typeof c === 'object' && c.name !== 'Salário')}
              keyExtractor={(item, index) =>
                item && item.id ? item.id.toString() : index.toString()
              }
              renderItem={({ item }) => {
                if (!item || typeof item !== 'object' || !item.name || !item.color) {
                  return null;
                }
                return (
                  <TouchableOpacity
                    style={styles.categoryOption}
                    onPress={() => {
                      setNewTransaction({ ...newTransaction, categoryId: item.id });
                      setVisible(false);
                    }}
                  >
                    <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryColor: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  categoryOptionText: { fontSize: 16 },
});
