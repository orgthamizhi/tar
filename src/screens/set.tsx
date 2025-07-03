import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { db } from '../lib/instant';
import { id } from '@instantdb/react-native';
import { useStore } from '../lib/store-context';

interface OptionValue {
  id: string;
  value: string;
  identifier: string;
  order: number;
  group?: string;
  type?: 'value';
}

interface GroupHeaderItem {
  id: string;
  type: 'header';
  groupKey: string;
  groupName: string;
}

interface InputRowItem {
  id: string;
  type: 'input';
  groupKey: string;
  rowIndex: number;
  value: string;
}

type ListItem = OptionValue | GroupHeaderItem | InputRowItem;

interface SetScreenProps {
  setId: string;
  setName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SetScreen({ setId, setName, onClose, onSave }: SetScreenProps) {
  const { currentStore } = useStore();
  const isNewSet = setId === 'new';
  const [currentSetName, setCurrentSetName] = useState(isNewSet ? '' : setName);
  const [groupNames, setGroupNames] = useState<{[key: string]: string}>({
    '1': 'Group 1',
    '2': 'Group 2',
    '3': 'Group 3'
  });
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [groupInputRows, setGroupInputRows] = useState<{[key: string]: string[]}>({
    '1': [],
    '2': [],
    '3': []
  });

  // Current working values (local state that gets saved on button press)
  const [currentValues, setCurrentValues] = useState<OptionValue[]>([]);

  // Force refresh counter to trigger re-renders when needed
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Use real-time data only to get initial snapshot, then work with local state
  const { data } = db.useQuery(
    !isNewSet && currentStore?.id ? {
      options: {
        $: { where: { set: setId, storeId: currentStore.id } }
      }
    } : {}
  );

  // Load initial data once from real-time query
  React.useEffect(() => {
    if (!isNewSet && data?.options && currentValues.length === 0) {
      const loadedValues = data.options
        .map((option: any) => ({
          id: option.id,
          value: option.value,
          identifier: option.identifier || `text:${option.value.substring(0, 2).toUpperCase()}`,
          order: option.order || 0,
          group: option.group || 'Group 1'
        }))
        .sort((a: any, b: any) => a.order - b.order);

      setCurrentValues(loadedValues);

      // Update group names from loaded data - preserve existing mapping
      const actualGroups = [...new Set(loadedValues.map((v: any) => v.group))];
      const newGroupNames: {[key: string]: string} = { ...groupNames };

      console.log('📋 Loading data - actual groups found:', actualGroups);
      console.log('📋 Current group names before update:', groupNames);

      // Map groups to keys more intelligently
      actualGroups.forEach((groupName: string) => {
        // First, check if this group name already exists in our mapping
        const existingKey = Object.keys(newGroupNames).find(key => newGroupNames[key] === groupName);

        if (existingKey) {
          // Group already mapped correctly, keep it
          console.log(`📋 Group "${groupName}" already mapped to key ${existingKey}`);
        } else {
          // Find the first available key for this new group
          const availableKey = ['1', '2', '3'].find(key =>
            !actualGroups.includes(newGroupNames[key]) || newGroupNames[key] === groupName
          );

          if (availableKey) {
            newGroupNames[availableKey] = groupName;
            console.log(`📋 Mapped group "${groupName}" to key ${availableKey}`);
          }
        }
      });

      console.log('📋 Final group names after update:', newGroupNames);
      setGroupNames(newGroupNames);
    }
  }, [data?.options, isNewSet, currentValues.length]);

  // Create flat list data with headers, values, and input rows
  const flatListData = React.useMemo(() => {
    const data: ListItem[] = [];

    ['1', '2', '3'].forEach((groupKey) => {
      const currentGroupName = groupNames[groupKey];

      // Add group header
      data.push({
        id: `header_${groupKey}`,
        type: 'header',
        groupKey,
        groupName: currentGroupName
      } as GroupHeaderItem);

      // Add values for this group - filter by exact group name match
      const groupValues = currentValues
        .filter(value => value.group === currentGroupName)
        .sort((a, b) => a.order - b.order);

      // Add each value to the data array
      groupValues.forEach(value => {
        data.push(value);
      });

      // Add input rows for this group
      const inputRows = groupInputRows[groupKey] || [];
      inputRows.forEach((rowValue, rowIndex) => {
        data.push({
          id: `input_${groupKey}_${rowIndex}`,
          type: 'input',
          groupKey,
          rowIndex,
          value: rowValue
        } as InputRowItem);
      });
    });



    return data;
  }, [currentValues, groupNames, groupInputRows, refreshKey]);

  const handleSave = async () => {
    const trimmedSetName = currentSetName.trim();
    
    // Validation
    if (!currentStore?.id) {
      Alert.alert('Error', 'No store selected');
      return;
    }
    
    if (!trimmedSetName) {
      Alert.alert('Validation Error', 'Option set name cannot be empty');
      return;
    }
    
    if (trimmedSetName.length > 30) {
      Alert.alert('Validation Error', 'Option set name cannot exceed 30 characters');
      return;
    }
    
    if (isNewSet && currentValues.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one value to the option set');
      return;
    }

    try {
      console.log('💾 Saving option set:', trimmedSetName, 'with values:', currentValues);
      
      // If it's a new set, create it first
      if (isNewSet && currentValues.length > 0) {
        console.log('🆕 Creating new option set with', currentValues.length, 'values');
        const transactions = currentValues.map((value) => {
          const optionId = id();
          const optionData = {
            set: trimmedSetName,
            value: value.value,
            identifier: value.identifier,
            order: value.order, // Use the actual order from the value
            group: value.group,
            storeId: currentStore.id
          };
          console.log('📝 Creating option:', optionData);
          return db.tx.options[optionId].update(optionData);
        });

        await db.transact(transactions);
        console.log('✅ New option set created successfully');
      } else if (!isNewSet) {
        console.log('📝 Updating existing option set with', currentValues.length, 'values');
        // Update existing set - preserve the order values from the state
        const transactions = currentValues.map((value) => {
          const optionData = {
            set: trimmedSetName,
            value: value.value,
            identifier: value.identifier,
            order: value.order, // Use the actual order from the value, not the index
            group: value.group,
            storeId: currentStore.id // Add missing storeId for updates
          };
          console.log('📝 Updating option:', value.id, optionData);
          return db.tx.options[value.id].update(optionData);
        });

        await db.transact(transactions);
        console.log('✅ Option set updated successfully');
      }

      onSave();
    } catch (error) {
      console.error('❌ Error saving option set:', error);
      Alert.alert('Error', 'Failed to save option set');
    }
  };

  const addRowToGroup = (groupKey: string) => {
    setGroupInputRows(prev => ({
      ...prev,
      [groupKey]: [...prev[groupKey], '']
    }));
  };

  const updateRowValue = (groupKey: string, rowIndex: number, value: string) => {
    setGroupInputRows(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].map((row, index) =>
        index === rowIndex ? value : row
      )
    }));
  };

  const submitRowValue = async (groupKey: string, rowIndex: number) => {
    const trimmedValue = groupInputRows[groupKey][rowIndex]?.trim();

    // Validation
    if (!trimmedValue) {
      Alert.alert('Validation Error', 'Value name cannot be empty');
      return;
    }

    if (trimmedValue.length > 50) {
      Alert.alert('Validation Error', 'Value name cannot exceed 50 characters');
      return;
    }

    // Check for duplicates
    const isDuplicate = currentValues.some(v =>
      v.value.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (isDuplicate) {
      Alert.alert('Validation Error', 'A value with this name already exists');
      return;
    }

    const newValue: OptionValue = {
      id: isNewSet ? `temp_${Date.now()}` : id(),
      value: trimmedValue,
      identifier: `text:${trimmedValue.substring(0, 2).toUpperCase()}`,
      order: currentValues.length,
      group: groupNames[groupKey] || groupKey
    };

    // Add to current working values (will be saved when Save button is pressed)
    setCurrentValues([...currentValues, newValue]);

    // Clear the input for this row
    updateRowValue(groupKey, rowIndex, '');
  };

  const updateGroupName = (groupKey: string, newName: string) => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== groupNames[groupKey]) {
      const oldGroupName = groupNames[groupKey];
      console.log(`🔄 Updating group ${groupKey}: "${oldGroupName}" → "${trimmedName}"`);

      // Update values first - use functional update to ensure we have latest state
      setCurrentValues(prevValues => {
        const updatedValues = prevValues.map(value =>
          value.group === oldGroupName
            ? { ...value, group: trimmedName }
            : value
        );
        console.log(`📝 Updated ${updatedValues.filter(v => v.group === trimmedName).length} values to group "${trimmedName}"`);
        return updatedValues;
      });

      // Update group names - use functional update
      setGroupNames(prevNames => {
        const newNames = { ...prevNames, [groupKey]: trimmedName };
        console.log('📝 New group names:', newNames);
        return newNames;
      });

      // Force refresh after state updates
      setTimeout(() => forceRefresh(), 100);

      console.log('✅ Group name update completed');
    }
    setEditingGroup(null);
    setEditingGroupName('');
  };



  const removeValue = (valueId: string) => {
    // Remove from current working values (will be saved when Save button is pressed)
    setCurrentValues(currentValues.filter(v => v.id !== valueId));
    console.log('✅ Value removed from working state');
  };

  const moveItemUp = (value: OptionValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const groupValues = currentValues
      .filter(v => v.group === value.group)
      .sort((a, b) => a.order - b.order);

    const currentIndex = groupValues.findIndex(v => v.id === value.id);
    if (currentIndex <= 0) return; // Already at top

    // Swap with previous item
    const newOrder = [...groupValues];
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];

    // Update orders
    const updates = newOrder.map((item, index) => ({ id: item.id, order: index }));
    const updatedValues = currentValues.map(v => {
      const update = updates.find(u => u.id === v.id);
      return update ? { ...v, order: update.order } : v;
    });

    setCurrentValues(updatedValues);
    forceRefresh();
    console.log('✅ Item moved up');
  };

  const moveItemDown = (value: OptionValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const groupValues = currentValues
      .filter(v => v.group === value.group)
      .sort((a, b) => a.order - b.order);

    const currentIndex = groupValues.findIndex(v => v.id === value.id);
    if (currentIndex >= groupValues.length - 1) return; // Already at bottom

    // Swap with next item
    const newOrder = [...groupValues];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];

    // Update orders
    const updates = newOrder.map((item, index) => ({ id: item.id, order: index }));
    const updatedValues = currentValues.map(v => {
      const update = updates.find(u => u.id === v.id);
      return update ? { ...v, order: update.order } : v;
    });

    setCurrentValues(updatedValues);
    forceRefresh();
    console.log('✅ Item moved down');
  };







  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
      }}>
        <TouchableOpacity onPress={onClose}>
          <Text style={{
            fontSize: 17,
            color: '#8E8E93',
            fontWeight: '400',
          }}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 17,
          fontWeight: '600',
          color: '#1C1C1E',
        }}>
          {isNewSet ? 'New Option Set' : 'Edit Option Set'}
        </Text>
        
        <TouchableOpacity onPress={handleSave}>
          <Text style={{
            fontSize: 17,
            color: '#007AFF',
            fontWeight: '600',
          }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Option Set Name Input */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
      }}>
        <TextInput
          style={{
            fontSize: 17,
            color: '#1C1C1E',
            fontWeight: '400',
            paddingVertical: 8,
          }}
          value={currentSetName}
          onChangeText={setCurrentSetName}
          placeholder="Label"
          placeholderTextColor="#C7C7CC"
          autoFocus={isNewSet && !editingGroup && currentValues.length === 0}
        />
      </View>

      {/* Groups Section - Using single FlatList to avoid VirtualizedList nesting */}
      <FlatList
        data={flatListData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        extraData={`${JSON.stringify(groupNames)}-${currentValues.length}-${refreshKey}`}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            const headerItem = item as GroupHeaderItem;
            return (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: '#F8F9FA',
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5EA',
              }}>
                {editingGroup === headerItem.groupKey ? (
                  <TextInput
                    key={`group-input-${headerItem.groupKey}`}
                    style={{
                      flex: 1,
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#1C1C1E',
                      paddingVertical: 0,
                      marginRight: 10,
                    }}
                    value={editingGroupName}
                    onChangeText={setEditingGroupName}
                    onSubmitEditing={() => updateGroupName(headerItem.groupKey, editingGroupName)}
                    onBlur={() => updateGroupName(headerItem.groupKey, editingGroupName)}
                    selectTextOnFocus={true}
                    autoFocus={true}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      console.log(`🎯 Tapping group ${headerItem.groupKey} (${headerItem.groupName})`);
                      setEditingGroup(headerItem.groupKey);
                      setEditingGroupName(headerItem.groupName);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#1C1C1E',
                    }}>
                      {headerItem.groupName}
                    </Text>
                  </TouchableOpacity>
                )}


                <TouchableOpacity
                  onPress={() => addRowToGroup(headerItem.groupKey)}
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#1C1C1E',
                  }}>+</Text>
                </TouchableOpacity>
              </View>
            );
          }

          if (item.type === 'input') {
            const inputItem = item as InputRowItem;
            return (
              <View style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5EA',
              }}>
                <TextInput
                  style={{
                    fontSize: 16,
                    color: '#1C1C1E',
                    paddingVertical: 12,
                    paddingHorizontal: 0,
                    backgroundColor: 'transparent',
                  }}
                  value={inputItem.value}
                  onChangeText={(text) => updateRowValue(inputItem.groupKey, inputItem.rowIndex, text)}
                  placeholder="Enter value name"
                  placeholderTextColor="#8E8E93"
                  onSubmitEditing={() => submitRowValue(inputItem.groupKey, inputItem.rowIndex)}
                  underlineColorAndroid="transparent"
                />
              </View>
            );
          }

          // Regular option value item with drag functionality
          const value = item as OptionValue;
          const groupKey = Object.keys(groupNames).find(key => groupNames[key] === value.group) || '1';

          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5EA',
              }}
            >
              {/* Identifier Tile */}
              <View style={{
                width: 40,
                height: 40,
                marginRight: 12,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: value.identifier.startsWith('color:')
                  ? value.identifier.replace('color:', '')
                  : '#F0F0F0',
              }}>
                {value.identifier.startsWith('text:') && (
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#1C1C1E',
                  }}>
                    {value.identifier.replace('text:', '')}
                  </Text>
                )}
              </View>

              {/* Value Name */}
              <Text style={{
                flex: 1,
                fontSize: 16,
                color: '#1C1C1E',
              }}>
                {value.value}
              </Text>

              {/* Reorder buttons */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => moveItemUp(value)}
                  style={{
                    padding: 8,
                    opacity: 0.6,
                  }}
                >
                  <Feather name="chevron-up" size={16} color="#8E8E93" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => moveItemDown(value)}
                  style={{
                    padding: 8,
                    opacity: 0.6,
                  }}
                >
                  <Feather name="chevron-down" size={16} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
