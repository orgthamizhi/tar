import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, StatusBar, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createOptionSet, createOption } from '../lib/crud';
import { useStore } from '../lib/store-context';
import LabelSelector from './label-selector';

const { height: screenHeight } = Dimensions.get('window');

interface Option {
  id: string;
  value: string;
  labelType: 'text' | 'color' | 'image';
  labelValue: string;
}

interface OptionSetCreateProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OptionSetCreate({ onClose, onSuccess }: OptionSetCreateProps) {
  const { currentStore } = useStore();
  const [optionSetName, setOptionSetName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [selectedOptionForLabel, setSelectedOptionForLabel] = useState<Option | null>(null);

  const addOption = () => {
    if (newOptionValue.trim()) {
      const newOption: Option = {
        id: Date.now().toString(),
        value: newOptionValue.trim(),
        labelType: 'text',
        labelValue: newOptionValue.trim()
      };
      setOptions([...options, newOption]);
      setNewOptionValue('');
    }
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const startEditingOption = (option: Option) => {
    setEditingOptionId(option.id);
    setEditingValue(option.value);
  };

  const saveOptionValue = () => {
    if (!editingOptionId || !editingValue.trim()) {
      setEditingOptionId(null);
      return;
    }

    setOptions(options.map(option =>
      option.id === editingOptionId
        ? { ...option, value: editingValue.trim() }
        : option
    ));
    setEditingOptionId(null);
    setEditingValue('');
  };

  const updateOptionLabel = (id: string, labelType: 'text' | 'color' | 'image', labelValue: string) => {
    setOptions(options.map(option =>
      option.id === id
        ? { ...option, labelType, labelValue }
        : option
    ));
  };

  const openLabelSelector = (option: Option) => {
    setSelectedOptionForLabel(option);
    setShowLabelSelector(true);
  };

  const handleLabelSave = (labelType: 'text' | 'color' | 'image', labelValue: string) => {
    if (selectedOptionForLabel) {
      updateOptionLabel(selectedOptionForLabel.id, labelType, labelValue);
    }
    setShowLabelSelector(false);
    setSelectedOptionForLabel(null);
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
          const option = options[i];
          const identifier = `${option.labelType}:${option.labelValue}`;

          await createOption({
            set: optionSetName.trim(),
            identifier,
            value: option.value,
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 99999,
        width: '100%',
        height: screenHeight,
      }}>
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
              Create option set
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!canCreate}
            style={{
              backgroundColor: canCreate ? '#3B82F6' : '#E5E7EB',
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
            <TextInput
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#111827',
              }}
              placeholder="Option set name"
              placeholderTextColor="#9CA3AF"
              value={optionSetName}
              onChangeText={setOptionSetName}
            />
          </View>

          {/* Add Option Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#D1D5DB',
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
              placeholder="Add option value"
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
          {options.map((option) => (
            <View
              key={option.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                marginBottom: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              {/* POS-Style Label Tile */}
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: option.labelType === 'color' ? option.labelValue : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginRight: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => openLabelSelector(option)}
              >
                {option.labelType === 'text' && (
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
                    {option.labelValue.slice(0, 2).toUpperCase()}
                  </Text>
                )}
                {option.labelType === 'image' && (
                  <MaterialIcons name="image" size={20} color="#6B7280" />
                )}
              </TouchableOpacity>

              {/* Value - Editable */}
              {editingOptionId === option.id ? (
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#111827',
                    borderBottomWidth: 1,
                    borderBottomColor: '#3B82F6',
                    paddingVertical: 4,
                  }}
                  value={editingValue}
                  onChangeText={setEditingValue}
                  onBlur={saveOptionValue}
                  onSubmitEditing={saveOptionValue}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => startEditingOption(option)}
                >
                  <Text style={{ fontSize: 16, color: '#111827' }}>
                    {option.value}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => removeOption(option.id)}>
                <MaterialIcons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Label Selector */}
        <LabelSelector
          visible={showLabelSelector}
          currentType={selectedOptionForLabel?.labelType || 'text'}
          currentValue={selectedOptionForLabel?.labelValue || ''}
          onClose={() => {
            setShowLabelSelector(false);
            setSelectedOptionForLabel(null);
          }}
          onSave={handleLabelSave}
        />
      </View>
    </>
  );
}
