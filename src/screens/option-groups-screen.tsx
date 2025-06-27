import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, FlatList, StatusBar, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet, createOption, updateOption, deleteOption } from '../lib/crud';
import { useStore } from '../lib/store-context';

interface OptionValue {
  id: string;
  value: string;
  identifier: string;
  order: number;
}

interface OptionGroup {
  name: string;
  values: OptionValue[];
}

interface OptionGroupsScreenProps {
  visible: boolean;
  optionSetName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function OptionGroupsScreen({ 
  visible, 
  optionSetName, 
  onClose, 
  onSave 
}: OptionGroupsScreenProps) {
  const { currentStore } = useStore();
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [newValueInputs, setNewValueInputs] = useState<{[key: string]: string}>({});
  const [reordering, setReordering] = useState(false);

  const MAX_GROUPS = 3;

  useEffect(() => {
    if (visible && optionSetName) {
      loadGroups();
    }
  }, [visible, optionSetName]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await getOptionsForSet(optionSetName);

      if (result.success && result.options) {
        // Group options by their group field
        const groupedOptions = result.options.reduce((acc, option) => {
          const groupName = option.group || 'Default';
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push({
            id: option.id,
            value: option.value || '',
            identifier: option.identifier || '',
            order: option.order || 0
          });
          return acc;
        }, {} as Record<string, OptionValue[]>);

        // Convert to array format and sort values by order
        const groupsArray = Object.entries(groupedOptions).map(([name, values]) => ({
          name,
          values: values.sort((a, b) => a.order - b.order)
        }));

        setGroups(groupsArray);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGroup = () => {
    if (groups.length >= MAX_GROUPS) {
      Alert.alert('Maximum Groups', `You can only create up to ${MAX_GROUPS} groups.`);
      return;
    }

    const groupNumber = groups.length + 1;
    const newGroup: OptionGroup = {
      name: `Group ${groupNumber}`,
      values: []
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroupName = (index: number, newName: string) => {
    const updatedGroups = [...groups];
    updatedGroups[index].name = newName.trim() || `Group ${index + 1}`;
    setGroups(updatedGroups);
  };

  const deleteGroup = (index: number) => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group and all its values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const group = groups[index];
            // Delete all values in the group
            for (const value of group.values) {
              await deleteOption(value.id);
            }
            const updatedGroups = groups.filter((_, i) => i !== index);
            setGroups(updatedGroups);
          }
        }
      ]
    );
  };

  const addValue = async (groupIndex: number) => {
    const inputValue = newValueInputs[groupIndex.toString()]?.trim();
    if (!inputValue) return;

    try {
      const group = groups[groupIndex];
      const newOrder = group.values.length + 1;

      const result = await createOption({
        set: optionSetName,
        identifier: `text:${inputValue}`,
        value: inputValue,
        order: newOrder,
        storeId: currentStore?.id || '',
        group: group.name,
      });

      if (result.success) {
        const newValue: OptionValue = {
          id: result.id || Date.now().toString(),
          value: inputValue,
          identifier: `text:${inputValue}`,
          order: newOrder
        };

        const updatedGroups = [...groups];
        updatedGroups[groupIndex].values.push(newValue);
        setGroups(updatedGroups);

        // Clear input
        setNewValueInputs(prev => ({
          ...prev,
          [groupIndex.toString()]: ''
        }));
      }
    } catch (error) {
      console.error('Error adding value:', error);
    }
  };

  const removeValue = async (groupIndex: number, valueIndex: number) => {
    const value = groups[groupIndex].values[valueIndex];
    
    try {
      const result = await deleteOption(value.id);
      if (result.success) {
        const updatedGroups = [...groups];
        updatedGroups[groupIndex].values.splice(valueIndex, 1);
        setGroups(updatedGroups);
      }
    } catch (error) {
      console.error('Error removing value:', error);
    }
  };

  const startEditingValue = (value: OptionValue) => {
    setEditingValueId(value.id);
    setEditingValue(value.value);
  };

  const saveValueEdit = async () => {
    if (!editingValueId || !editingValue.trim()) {
      setEditingValueId(null);
      return;
    }

    try {
      const result = await updateOption(editingValueId, { value: editingValue.trim() });
      
      if (result.success) {
        const updatedGroups = groups.map(group => ({
          ...group,
          values: group.values.map(val =>
            val.id === editingValueId
              ? { ...val, value: editingValue.trim() }
              : val
          )
        }));
        setGroups(updatedGroups);
      }
    } catch (error) {
      console.error('Error updating value:', error);
    } finally {
      setEditingValueId(null);
      setEditingValue('');
    }
  };



  const moveValue = async (groupIndex: number, fromIndex: number, toIndex: number) => {
    if (reordering) return; // Prevent multiple simultaneous reorders

    setReordering(true);
    const updatedGroups = [...groups];
    const group = updatedGroups[groupIndex];
    const [movedValue] = group.values.splice(fromIndex, 1);
    group.values.splice(toIndex, 0, movedValue);

    // Update order for all values in the group and save to database
    try {
      for (let i = 0; i < group.values.length; i++) {
        const value = group.values[i];
        const newOrder = i + 1;
        value.order = newOrder;

        // Update in database
        await updateOption(value.id, { order: newOrder });
      }

      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order');
      // Revert on error
      loadGroups();
    } finally {
      setReordering(false);
    }
  };

  const renderValue = (value: OptionValue, valueIndex: number, groupIndex: number) => {
    const [labelType, labelValue] = (value.identifier || '').split(':');
    
    return (
      <View key={value.id} style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: reordering ? '#F9FAFB' : 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        opacity: reordering ? 0.7 : 1,
      }}>
        {/* Reorder Controls */}
        <View style={{ paddingRight: 12, alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              paddingVertical: 2,
              opacity: (valueIndex === 0 || reordering) ? 0.3 : 1
            }}
            onPress={() => {
              if (valueIndex > 0 && !reordering) {
                moveValue(groupIndex, valueIndex, valueIndex - 1);
              }
            }}
            disabled={valueIndex === 0 || reordering}
          >
            <MaterialIcons name="keyboard-arrow-up" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 2,
              opacity: (valueIndex === groups[groupIndex].values.length - 1 || reordering) ? 0.3 : 1
            }}
            onPress={() => {
              if (valueIndex < groups[groupIndex].values.length - 1 && !reordering) {
                moveValue(groupIndex, valueIndex, valueIndex + 1);
              }
            }}
            disabled={valueIndex === groups[groupIndex].values.length - 1 || reordering}
          >
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Order Number */}
        <View style={{
          width: 24,
          height: 24,
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280' }}>
            {valueIndex + 1}
          </Text>
        </View>

        {/* POS-Style Label Tile */}
        <TouchableOpacity
          style={{
            width: 32,
            height: 32,
            backgroundColor: labelType === 'color' ? labelValue : '#F3F4F6',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            // Label selector functionality removed - using Shopify style now
          }}
        >
          {(labelType === 'text' || labelType === 'label') && labelValue && (
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#111827' }}>
              {labelValue.slice(0, 2).toUpperCase()}
            </Text>
          )}
          {labelType === 'image' && (
            <MaterialIcons name="image" size={16} color="#6B7280" />
          )}
        </TouchableOpacity>

        {/* Value - Editable */}
        {editingValueId === value.id ? (
          <TextInput
            style={{
              flex: 1,
              fontSize: 14,
              color: '#111827',
              paddingVertical: 4,
              borderWidth: 0,
            }}
            value={editingValue}
            onChangeText={setEditingValue}
            onBlur={saveValueEdit}
            onSubmitEditing={saveValueEdit}
            autoFocus
          />
        ) : (
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => startEditingValue(value)}
          >
            <Text style={{ fontSize: 14, color: '#111827' }}>
              {value.value}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => removeValue(groupIndex, valueIndex)}>
          <MaterialIcons name="close" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          backgroundColor: 'white',
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              Option Groups
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {optionSetName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              onSave();
              onClose();
            }}
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={groups}
          keyExtractor={(item, index) => index.toString()}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item: group, index: groupIndex }) => (
            <View style={{ marginBottom: 24 }}>
              {/* Group Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
                backgroundColor: '#F9FAFB',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                  }}
                  value={group.name}
                  onChangeText={(text) => updateGroupName(groupIndex, text)}
                  placeholder={`Group ${groupIndex + 1}`}
                />
                <TouchableOpacity onPress={() => deleteGroup(groupIndex)}>
                  <MaterialIcons name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Group Values */}
              <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}>
                {group.values.map((value, valueIndex) => 
                  renderValue(value, valueIndex, groupIndex)
                )}
                
                {/* Add Value Input */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: group.values.length > 0 ? 1 : 0,
                  borderTopColor: '#F3F4F6',
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: '#111827',
                      paddingVertical: 8,
                    }}
                    placeholder="Add value"
                    placeholderTextColor="#9CA3AF"
                    value={newValueInputs[groupIndex.toString()] || ''}
                    onChangeText={(text) => setNewValueInputs(prev => ({
                      ...prev,
                      [groupIndex.toString()]: text
                    }))}
                    onSubmitEditing={() => addValue(groupIndex)}
                    returnKeyType="done"
                  />
                  {newValueInputs[groupIndex.toString()]?.trim() && (
                    <TouchableOpacity onPress={() => addValue(groupIndex)}>
                      <MaterialIcons name="add" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            groups.length < MAX_GROUPS ? (
              <TouchableOpacity
                onPress={addGroup}
                style={{
                  backgroundColor: '#F3F4F6',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  borderStyle: 'dashed',
                }}
              >
                <MaterialIcons name="add" size={24} color="#6B7280" />
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  Add Group ({groups.length}/{MAX_GROUPS})
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{
                backgroundColor: '#FEF2F2',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, color: '#7F1D1D', textAlign: 'center' }}>
                  Maximum of {MAX_GROUPS} groups reached
                </Text>
              </View>
            )
          }
        />


      </View>
    </Modal>
  );
}
