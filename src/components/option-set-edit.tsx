import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet, updateOptionSet, updateOption, createOption, deleteOption, deleteOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';
import IdentifierDrawer from './identifier-drawer';

interface Option {
  id: string;
  value: string;
  identifier: string;
  order: number;
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
            Edit option
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
            value={editedName}
            onChangeText={setEditedName}
          />
        </View>



        {/* Options Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
            {editedName} options
          </Text>

          {/* Existing Options */}
          {options.map((option) => (
            <View
              key={option.id}
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
              {renderIdentifierSquare(option)}
              <MaterialIcons name="drag-handle" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 16, color: '#111827' }}>
                {option.value}
              </Text>
              <TouchableOpacity onPress={() => removeOption(option.id)}>
                <MaterialIcons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Option Input */}
          <TouchableOpacity
            onPress={() => setNewOptionValue('')}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 16, color: '#9CA3AF' }}>
              Add option
            </Text>
          </TouchableOpacity>
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
  );
}
