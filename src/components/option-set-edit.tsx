import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, StatusBar, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet, updateOptionSet, updateOption, createOption, deleteOption, deleteOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';
import LabelSelector from './label-selector';

const { height: screenHeight } = Dimensions.get('window');

interface Option {
  id: string;
  value: string;
  identifier: string;
  order: number;
  labelType?: 'text' | 'color' | 'image';
  labelValue?: string;
}

interface OptionSetEditProps {
  optionSetId: string;
  optionSetName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OptionSetEdit({
  optionSetId,
  optionSetName,
  onClose,
  onSuccess
}: OptionSetEditProps) {
  const { currentStore } = useStore();
  const [editedName, setEditedName] = useState(optionSetName);
  const [options, setOptions] = useState<Option[]>([]);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showIdentifierDrawer, setShowIdentifierDrawer] = useState(false);
  const [selectedOptionForIdentifier, setSelectedOptionForIdentifier] = useState<Option | null>(null);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [selectedOptionForLabel, setSelectedOptionForLabel] = useState<Option | null>(null);

  useEffect(() => {
    loadOptions();
  }, [optionSetName]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const result = await getOptionsForSet(optionSetName);

      if (result.success && result.options) {
        setOptions(result.options);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      Alert.alert('Error', 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const addOption = async () => {
    if (!newOptionValue.trim() || !currentStore?.id) return;

    try {
      const nextOrder = Math.max(...options.map(o => o.order || 0), 0) + 1;

      const result = await createOption({
        set: editedName,
        identifier: '', // Will be set later when user configures
        value: newOptionValue.trim(),
        order: nextOrder,
        storeId: currentStore.id,
      });

      if (result.success) {
        setOptions([...options, {
          id: result.id!,
          value: newOptionValue.trim(),
          identifier: '',
          order: nextOrder,
        }]);
        setNewOptionValue('');
      }
    } catch (error) {
      console.error('Error adding option:', error);
      Alert.alert('Error', 'Failed to add option');
    }
  };

  const removeOption = async (optionId: string) => {
    try {
      const result = await deleteOption(optionId);
      if (result.success) {
        setOptions(options.filter(opt => opt.id !== optionId));
      }
    } catch (error) {
      console.error('Error removing option:', error);
      Alert.alert('Error', 'Failed to remove option');
    }
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Please fill in option set name');
      return;
    }

    try {
      setSaving(true);

      // Update the option set
      const result = await updateOptionSet(optionSetId, {
        set: editedName.trim(),
        storeId: currentStore?.id || '',
      });

      if (result.success) {
        Alert.alert('Success', 'Option set updated successfully', [
          { text: 'OK', onPress: onSuccess }
        ]);
      } else {
        throw new Error(result.error || 'Failed to update option set');
      }
    } catch (error) {
      console.error('Error saving option set:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Option Set',
      'To delete an option set, first delete all options.',
      [{ text: 'OK' }]
    );
  };

  const openIdentifierDrawer = (option: Option) => {
    setSelectedOptionForIdentifier(option);
    setShowIdentifierDrawer(true);
  };

  const handleIdentifierSave = (identifier: string) => {
    if (selectedOptionForIdentifier) {
      setOptions(options.map(opt =>
        opt.id === selectedOptionForIdentifier.id
          ? { ...opt, identifier }
          : opt
      ));
    }
  };

  const startEditingOption = (option: Option) => {
    setEditingOptionId(option.id);
    setEditingValue(option.value);
  };

  const saveOptionValue = async () => {
    if (!editingOptionId || !editingValue.trim()) {
      setEditingOptionId(null);
      return;
    }

    try {
      const result = await updateOption(editingOptionId, { value: editingValue.trim() });

      if (result.success) {
        setOptions(options.map(opt =>
          opt.id === editingOptionId
            ? { ...opt, value: editingValue.trim() }
            : opt
        ));
      }
    } catch (error) {
      console.error('Error updating option value:', error);
    } finally {
      setEditingOptionId(null);
      setEditingValue('');
    }
  };

  const cancelEditingOption = () => {
    setEditingOptionId(null);
    setEditingValue('');
  };

  const openLabelSelector = (option: Option) => {
    setSelectedOptionForLabel(option);
    setShowLabelSelector(true);
  };

  const handleLabelSave = (labelType: 'text' | 'color' | 'image', labelValue: string) => {
    if (selectedOptionForLabel) {
      const identifier = `${labelType}:${labelValue}`;
      setOptions(options.map(opt =>
        opt.id === selectedOptionForLabel.id
          ? { ...opt, identifier }
          : opt
      ));
    }
    setShowLabelSelector(false);
    setSelectedOptionForLabel(null);
  };

  const renderIdentifierSquare = (option: Option) => {
    const identifier = option.identifier || '';
    const [type, value] = identifier.split(':');

    let content = null;
    let backgroundColor = '#F3F4F6';

    if (type === 'color' && value) {
      backgroundColor = value;
      content = null;
    } else if (type === 'label' && value) {
      content = (
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#111827',
          textAlign: 'center'
        }}>
          {value.slice(0, 2).toUpperCase()}
        </Text>
      );
    } else {
      // Default empty state
      content = (
        <View style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#D1D5DB',
        }} />
      );
    }

    return (
      <TouchableOpacity
        onPress={() => openIdentifierDrawer(option)}
        style={{
          width: 32,
          height: 32,
          backgroundColor,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
      >
        {content}
      </TouchableOpacity>
    );
  };

  const canSave = editedName.trim() && !saving;

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
              Edit option set
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{
              backgroundColor: canSave ? '#3B82F6' : '#E5E7EB',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}
          >
          <Text style={{
            color: canSave ? 'white' : '#9CA3AF',
            fontSize: 16,
            fontWeight: '600'
          }}>
            {saving ? 'Saving...' : 'Done'}
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
              value={editedName}
              onChangeText={setEditedName}
            />
          </View>

        {/* Options Section */}
        <View style={{ marginBottom: 24 }}>

          {/* Existing Options */}
          {options.map((option) => {
            const [labelType, labelValue] = (option.identifier || '').split(':');
            return (
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
                    backgroundColor: labelType === 'color' ? labelValue : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => openLabelSelector(option)}
                >
                  {labelType === 'label' && labelValue && (
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>
                      {labelValue.slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                  {labelType === 'image' && (
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
            );
          })}

          {/* Add Option Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#D1D5DB',
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginTop: 8,
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
        </View>

        {/* Delete Warning */}
        <View style={{
          backgroundColor: '#FEF2F2',
          padding: 16,
          borderRadius: 8,
          marginTop: 32,
        }}>
          <Text style={{ fontSize: 14, color: '#7F1D1D', textAlign: 'center' }}>
            To delete an option set, first delete all options.
          </Text>
        </View>
        </ScrollView>

        {/* Label Selector */}
        <LabelSelector
          visible={showLabelSelector}
          currentType={(selectedOptionForLabel?.identifier?.split(':')[0] as 'text' | 'color' | 'image') || 'text'}
          currentValue={selectedOptionForLabel?.identifier?.split(':')[1] || ''}
          onClose={() => {
            setShowLabelSelector(false);
            setSelectedOptionForLabel(null);
          }}
          onSave={handleLabelSave}
        />

        {/* Identifier Drawer */}
        <IdentifierDrawer
          visible={showIdentifierDrawer}
          optionId={selectedOptionForIdentifier?.id || ''}
          currentIdentifier={selectedOptionForIdentifier?.identifier || ''}
          onClose={() => {
            setShowIdentifierDrawer(false);
            setSelectedOptionForIdentifier(null);
          }}
          onSave={handleIdentifierSave}
        />
      </View>
    </>
  );
}
