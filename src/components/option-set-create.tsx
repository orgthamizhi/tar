import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createOptionSet, createOption } from '../lib/crud';
import { useStore } from '../lib/store-context';

interface OptionSetCreateProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OptionSetCreate({ onClose, onSuccess }: OptionSetCreateProps) {
  const { currentStore } = useStore();
  const [optionSetName, setOptionSetName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (newOptionValue.trim() && !options.includes(newOptionValue.trim())) {
      setOptions([...options, newOptionValue.trim()]);
      setNewOptionValue('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!optionSetName.trim()) {
      Alert.alert('Error', 'Please enter an option set name');
      return;
    }

    if (!currentStore?.id) {
      Alert.alert('Error', 'No store selected');
      return;
    }

    try {
      setCreating(true);

      // Create the option set
      const optionSetResult = await createOptionSet({
        set: optionSetName.trim(),
        storeId: currentStore.id,
      });

      if (!optionSetResult.success) {
        throw new Error(optionSetResult.error || 'Failed to create option set');
      }

      // Create individual options if any
      if (options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          await createOption({
            set: optionSetName.trim(),
            identifier: '', // Will be set later when user configures
            value: options[i],
            order: i + 1,
            storeId: currentStore.id,
          });
        }
      }

      Alert.alert('Success', 'Option set created successfully', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      console.error('Error creating option set:', error);
      Alert.alert('Error', 'Failed to create option set');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = optionSetName.trim() && !creating;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginRight: 16 }}
          >
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
            Create option
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!canCreate}
          style={{
            backgroundColor: canCreate ? '#9CA3AF' : '#E5E7EB',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
          }}
        >
          <Text style={{
            color: canCreate ? 'white' : '#9CA3AF',
            fontSize: 16,
            fontWeight: '600'
          }}>
            {creating ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Option Set Name */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            Option set
          </Text>
          <TextInput
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#111827',
            }}
            placeholder="T-shirt colour"
            placeholderTextColor="#9CA3AF"
            value={optionSetName}
            onChangeText={setOptionSetName}
          />
        </View>



        {/* Options Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
            Options
          </Text>

          {/* Add Option Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
          }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#111827',
              }}
              placeholder="Add option"
              placeholderTextColor="#9CA3AF"
              value={newOptionValue}
              onChangeText={setNewOptionValue}
              onSubmitEditing={addOption}
              returnKeyType="done"
            />
            {newOptionValue.trim() && (
              <TouchableOpacity onPress={addOption}>
                <MaterialIcons name="add" size={24} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>

          {/* Options List */}
          {options.map((option, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
              }}
            >
              <MaterialIcons name="drag-handle" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 16, color: '#111827' }}>
                {option}
              </Text>
              <TouchableOpacity onPress={() => removeOption(index)}>
                <MaterialIcons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
