import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StatusBar, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet, createOption, updateOption, deleteOption, updateOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';

interface OptionValue {
  id: string;
  value: string;
  identifier: string;
  order: number;
}

interface OptionGroup {
  id: string;
  name: string;
  valueCount: number;
  values: string[];
}

interface GroupScreenProps {
  visible: boolean;
  group: OptionGroup;
  optionSetName: string;
  onClose: () => void;
}

export default function GroupScreen({ 
  visible, 
  group, 
  optionSetName, 
  onClose 
}: GroupScreenProps) {
  const { currentStore } = useStore();
  const [groupName, setGroupName] = useState(group.name);
  const [values, setValues] = useState<OptionValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && group) {
      setGroupName(group.name);
      loadValues();
    }
  }, [visible, group]);

  const loadValues = async () => {
    try {
      setLoading(true);
      const result = await getOptionsForSet(optionSetName);

      if (result.success && result.options) {
        // Filter options for this group
        const groupValues = result.options
          .filter(option => (option.group || 'Default') === group.name)
          .map(option => ({
            id: option.id,
            value: option.value || '',
            identifier: option.identifier || '',
            order: option.order || 0
          }))
          .sort((a, b) => a.order - b.order);

        setValues(groupValues);
      }
    } catch (error) {
      console.error('Error loading values:', error);
    } finally {
      setLoading(false);
    }
  };

  const addValue = async () => {
    if (!newValue.trim()) return;

    try {
      const result = await createOption({
        set: optionSetName,
        identifier: `text:${newValue.trim()}`,
        value: newValue.trim(),
        order: values.length + 1,
        storeId: currentStore?.id || '',
        group: group.name,
      });

      if (result.success) {
        const newOptionValue: OptionValue = {
          id: result.id || Date.now().toString(),
          value: newValue.trim(),
          identifier: `text:${newValue.trim()}`,
          order: values.length + 1
        };

        setValues([...values, newOptionValue]);
        setNewValue('');
      }
    } catch (error) {
      console.error('Error adding value:', error);
    }
  };

  const deleteValue = async (valueId: string) => {
    try {
      const result = await deleteOption(valueId);
      if (result.success) {
        setValues(values.filter(v => v.id !== valueId));
      }
    } catch (error) {
      console.error('Error deleting value:', error);
    }
  };

  const moveValue = async (fromIndex: number, toIndex: number) => {
    const updatedValues = [...values];
    const [movedValue] = updatedValues.splice(fromIndex, 1);
    updatedValues.splice(toIndex, 0, movedValue);

    // Update order for all values and save to database
    try {
      for (let i = 0; i < updatedValues.length; i++) {
        const value = updatedValues[i];
        const newOrder = i + 1;
        value.order = newOrder;
        
        // Update in database
        await updateOption(value.id, { order: newOrder });
      }
      
      setValues(updatedValues);
    } catch (error) {
      console.error('Error updating order:', error);
      // Revert on error
      loadValues();
    }
  };

  const saveGroupName = async () => {
    if (groupName.trim() !== group.name) {
      try {
        setSaving(true);
        // Update all options in this group with the new group name
        for (const value of values) {
          await updateOption(value.id, { group: groupName.trim() });
        }
      } catch (error) {
        console.error('Error saving group name:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const renderValueItem = ({ item, index }: { item: OptionValue; index: number }) => (
    <View style={{
      backgroundColor: 'white',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      {/* Drag Handle */}
      <View style={{ paddingRight: 12, alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            paddingVertical: 2,
            opacity: index === 0 ? 0.3 : 1
          }}
          onPress={() => {
            if (index > 0) {
              moveValue(index, index - 1);
            }
          }}
          disabled={index === 0}
        >
          <MaterialIcons name="keyboard-arrow-up" size={16} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 2,
            opacity: index === values.length - 1 ? 0.3 : 1
          }}
          onPress={() => {
            if (index < values.length - 1) {
              moveValue(index, index + 1);
            }
          }}
          disabled={index === values.length - 1}
        >
          <MaterialIcons name="keyboard-arrow-down" size={16} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Value Text */}
      <Text style={{
        fontSize: 17,
        color: '#000000',
        fontWeight: '400',
        flex: 1,
      }}>
        {item.value}
      </Text>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => deleteValue(item.id)}
        style={{ padding: 4 }}
      >
        <MaterialIcons name="delete-outline" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    </View>
  );

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
          paddingHorizontal: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ width: 50 }} />
          <Text style={{
            fontSize: 17,
            fontWeight: '600',
            color: '#000000',
            flex: 1,
            textAlign: 'left',
            marginLeft: 16
          }}>
            {groupName || 'New Group'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              saveGroupName();
              onClose();
            }}
          >
            <Text style={{
              fontSize: 17,
              color: '#007AFF',
              fontWeight: '400'
            }}>
              {saving ? 'Saving...' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Name Field */}
          <View style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 13,
              color: '#8E8E93',
              marginBottom: 8,
              fontWeight: '400',
            }}>
              Name
            </Text>
            <TextInput
              style={{
                fontSize: 17,
                color: '#000000',
                fontWeight: '400',
                padding: 0,
              }}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Option name"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          {/* Values Section */}
          <View style={{ marginTop: 24, flex: 1 }}>
            <Text style={{
              fontSize: 13,
              color: '#8E8E93',
              marginHorizontal: 16,
              marginBottom: 8,
              fontWeight: '400',
            }}>
              Values ({values.length})
            </Text>

            {/* Values List */}
            <View style={{ backgroundColor: 'white', flex: 1 }}>
              <FlatList
                data={values}
                renderItem={renderValueItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
              
              {/* Add Value Input */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderTopWidth: values.length > 0 ? 1 : 0,
                borderTopColor: '#E5E7EB',
                backgroundColor: 'white',
              }}>
                <TextInput
                  style={{
                    fontSize: 17,
                    color: '#8E8E93',
                    fontWeight: '400',
                  }}
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder="Add value"
                  placeholderTextColor="#8E8E93"
                  onSubmitEditing={addValue}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
