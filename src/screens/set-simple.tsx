import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
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
  
  // Refs for each group TextInput to enable explicit focusing
  const groupInputRefs = useRef<{[key: string]: TextInput | null}>({
    '1': null,
    '2': null,
    '3': null
  });
  
  // Ref for option set name input to control its focus
  const setNameInputRef = useRef<TextInput>(null);

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

      // Extract unique groups and update group names
      const actualGroups = [...new Set(loadedValues.map((v: any) => v.group))];
      console.log('📋 Actual groups from data:', actualGroups);

      const newGroupNames = { ...groupNames };

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

  // Handle system back button
  useEffect(() => {
    const backAction = () => {
      console.log('🔙 Back button pressed, closing screen');
      onClose();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    console.log('📱 BackHandler registered');

    return () => {
      console.log('📱 BackHandler removed');
      backHandler.remove();
    };
  }, [onClose]);

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
    const currentIndex = currentValues.findIndex(v => v.id === value.id);
    if (currentIndex > 0) {
      const newValues = [...currentValues];
      [newValues[currentIndex], newValues[currentIndex - 1]] = [newValues[currentIndex - 1], newValues[currentIndex]];
      
      // Update order values
      newValues.forEach((v, index) => {
        v.order = index;
      });
      
      setCurrentValues(newValues);
    }
  };

  const moveItemDown = (value: OptionValue) => {
    const currentIndex = currentValues.findIndex(v => v.id === value.id);
    if (currentIndex < currentValues.length - 1) {
      const newValues = [...currentValues];
      [newValues[currentIndex], newValues[currentIndex + 1]] = [newValues[currentIndex + 1], newValues[currentIndex]];
      
      // Update order values
      newValues.forEach((v, index) => {
        v.order = index;
      });
      
      setCurrentValues(newValues);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header with Option Set Name */}
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
        <TextInput
          ref={setNameInputRef}
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: '600',
            color: '#1C1C1E',
            paddingVertical: 0,
            marginRight: 16,
          }}
          value={currentSetName}
          onChangeText={setCurrentSetName}
          placeholder={isNewSet ? 'New Option Set' : 'Edit Option Set'}
          placeholderTextColor="#8E8E93"
          autoFocus={false}
        />

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

      {/* Groups Section - Simple ScrollView approach */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {['1', '2', '3'].map((groupKey) => {
          const currentGroupName = groupNames[groupKey];

          return (
            <View key={groupKey}>
              {/* Group Header */}
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
                {editingGroup === groupKey ? (
                  <TextInput
                    ref={(ref) => {
                      console.log(`📝 Setting ref for group ${groupKey}:`, ref ? 'SUCCESS' : 'NULL');
                      groupInputRefs.current[groupKey] = ref;
                      // Auto-focus when ref is set
                      if (ref) {
                        setTimeout(() => {
                          console.log(`🎯 Auto-focusing group ${groupKey}`);
                          ref.focus();
                          if (setNameInputRef.current) {
                            setNameInputRef.current.blur();
                          }
                        }, 100);
                      }
                    }}
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
                    onFocus={() => console.log(`✅ Group input ${groupKey} actually got focus!`)}
                    onSubmitEditing={() => updateGroupName(groupKey, editingGroupName)}
                    onBlur={() => updateGroupName(groupKey, editingGroupName)}
                    selectTextOnFocus={true}
                    autoFocus={false}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      console.log(`🎯 Tapping group ${groupKey} (${currentGroupName})`);

                      // Blur the set name input first
                      if (setNameInputRef.current) {
                        setNameInputRef.current.blur();
                      }

                      setEditingGroup(groupKey);
                      setEditingGroupName(currentGroupName);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#1C1C1E',
                    }}>
                      {currentGroupName}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => addRowToGroup(groupKey)}
                  style={{
                    padding: 8,
                  }}
                >
                  <Feather name="plus" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {/* Values for this group */}
              {currentValues
                .filter(value => value.group === currentGroupName)
                .sort((a, b) => a.order - b.order)
                .map((value) => (
                  <View
                    key={value.id}
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

                    {/* Delete button */}
                    <TouchableOpacity
                      onPress={() => removeValue(value.id)}
                      style={{
                        padding: 8,
                        marginLeft: 8,
                      }}
                    >
                      <Feather name="trash-2" size={16} color="#FF3B30" />
                    </TouchableOpacity>

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
                ))}

              {/* Input rows for this group */}
              {(groupInputRows[groupKey] || []).map((rowValue, rowIndex) => (
                <View
                  key={`input_${groupKey}_${rowIndex}`}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor: 'white',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  }}
                >
                  <TextInput
                    style={{
                      fontSize: 16,
                      color: '#1C1C1E',
                      paddingVertical: 12,
                      paddingHorizontal: 0,
                      backgroundColor: 'transparent',
                    }}
                    value={rowValue}
                    onChangeText={(text) => updateRowValue(groupKey, rowIndex, text)}
                    placeholder="Enter value name"
                    placeholderTextColor="#8E8E93"
                    onSubmitEditing={() => submitRowValue(groupKey, rowIndex)}
                    underlineColorAndroid="transparent"
                  />
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
