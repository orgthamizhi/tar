import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet } from '../lib/crud';

interface Option {
  id: string;
  value: string;
  identifier: string;
  order: number;
}

interface OptionSetSelectProps {
  optionSetName: string;
  selectedOptions?: string[];
  onDone: (selectedOptions: string[]) => void;
  onClose: () => void;
}

export default function OptionSetSelect({
  optionSetName,
  selectedOptions = [],
  onDone,
  onClose
}: OptionSetSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedOptions));
  const [loading, setLoading] = useState(true);

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

  const filteredOptions = options.filter(option =>
    option.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedIds(newSelected);
  };

  const handleDone = () => {
    onDone(Array.from(selectedIds));
  };

  const renderOption = ({ item }: { item: Option }) => {
    const isSelected = selectedIds.has(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleOption(item.id)}
        style={{
          backgroundColor: 'white',
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, color: '#111827', flex: 1 }}>
          {item.value}
        </Text>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: isSelected ? '#3B82F6' : 'transparent',
          borderWidth: 2,
          borderColor: isSelected ? '#3B82F6' : '#D1D5DB',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isSelected && (
            <MaterialIcons name="check" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            {optionSetName}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleDone}
          style={{
            backgroundColor: '#3B82F6',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderTopColor: '#E5E7EB',
          borderBottomColor: '#E5E7EB',
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginHorizontal: -20,
        }}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: '#111827',
            }}
            placeholder={`Search ${optionSetName} options`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
          {optionSetName} options
        </Text>
      </View>

      {/* Options List */}
      <FlatList
        data={filteredOptions}
        renderItem={renderOption}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ backgroundColor: 'white' }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
              {loading ? 'Loading...' : searchQuery ? 'No options found' : 'No options available'}
            </Text>
          </View>
        }
      />

      {/* All options toggle */}
      <View style={{
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }}>
        <TouchableOpacity
          onPress={() => {
            if (selectedIds.size === options.length) {
              setSelectedIds(new Set());
            } else {
              setSelectedIds(new Set(options.map(opt => opt.id)));
            }
          }}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 16, color: '#111827' }}>
            All options
          </Text>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: selectedIds.size === options.length ? '#3B82F6' : 'transparent',
            borderWidth: 2,
            borderColor: selectedIds.size === options.length ? '#3B82F6' : '#D1D5DB',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {selectedIds.size === options.length && (
              <MaterialIcons name="check" size={16} color="white" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
