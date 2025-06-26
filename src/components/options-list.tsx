import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../lib/instant';
import { useStore } from '../lib/store-context';
import { getOptionSets, getOptionsForSet } from '../lib/crud';

interface OptionSetWithCount {
  id: string;
  set: string;
  optionCount: number;
}

interface OptionsListProps {
  onNavigateToCreate: () => void;
  onNavigateToSelect: (optionSetId: string, optionSetName: string) => void;
  onBack?: () => void;
}

export default function OptionsList({ onNavigateToCreate, onNavigateToSelect, onBack }: OptionsListProps) {
  const { currentStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [optionSets, setOptionSets] = useState<OptionSetWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptionSets();
  }, [currentStore]);

  const loadOptionSets = async () => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      const result = await getOptionSets(currentStore.id);
      
      if (result.success && result.optionSets) {
        // Get option counts for each set
        const setsWithCounts = await Promise.all(
          result.optionSets.map(async (set) => {
            const optionsResult = await getOptionsForSet(set.set);
            return {
              id: set.id,
              set: set.set,
              optionCount: optionsResult.success ? optionsResult.options?.length || 0 : 0
            };
          })
        );
        
        setOptionSets(setsWithCounts);
      }
    } catch (error) {
      console.error('Error loading option sets:', error);
      Alert.alert('Error', 'Failed to load option sets');
    } finally {
      setLoading(false);
    }
  };

  const filteredOptionSets = optionSets.filter(set =>
    set.set.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const handleAddNew = () => {
    onNavigateToCreate();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar with top and bottom borders - NO spacing above */}
      <View className="border-t border-b border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center">
          {/* Add Icon */}
          <TouchableOpacity onPress={handleAddNew}>
            <Feather name="plus" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Search Input */}
          <TextInput
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base text-gray-900 ml-3 mr-3"
            placeholderTextColor="#9CA3AF"
          />

          {/* Filter Icon */}
          <TouchableOpacity>
            <MaterialCommunityIcons name="sort-ascending" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Option Sets List */}
      <View className="flex-1">
        {filteredOptionSets.length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl">⚙️</Text>
              </View>
              <Text className="text-lg font-medium text-gray-900 mb-2">No option sets found</Text>
              <Text className="text-gray-500 text-center">
                {searchQuery ? 'Try adjusting your search' : 'Add your first option set to get started'}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredOptionSets}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: optionSet }) => (
              <TouchableOpacity
                onPress={() => onNavigateToSelect(optionSet.id, optionSet.set)}
                className="border-b border-gray-100 px-4 py-4 bg-white"
              >
                <View className="flex-row items-center">
                  {/* Option Set Icon */}
                  <View className="w-12 h-12 bg-gray-200 mr-3 items-center justify-center">
                    <Text className="text-lg">⚙️</Text>
                  </View>

                  {/* Option Set Info */}
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 mb-1" numberOfLines={1}>
                      {optionSet.set}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {optionSet.optionCount} options
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    </View>
  );
}
