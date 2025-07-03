import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StatusBar, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { db } from '../lib/instant';
import { id } from '@instantdb/react-native';
import { useStore } from '../lib/store-context';

interface OptionValue {
  id: string;
  value: string;
  identifier: string;
  order: number;
  group?: string;
}

interface SetScreenProps {
  setId: string;
  setName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SetScreen({ setId, setName, onClose, onSave }: SetScreenProps) {
  const { currentStore } = useStore();
  const [currentSetName, setCurrentSetName] = useState(setName);
  const [newValueText, setNewValueText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Group 1');
  const [groupNames, setGroupNames] = useState<{[key: string]: string}>({
    'Group 1': 'Group 1',
    'Group 2': 'Group 2',
    'Group 3': 'Group 3'
  });
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const isNewSet = setId === 'new';

  // Use real-time subscription for existing sets
  const { data, isLoading, error } = db.useQuery(
    !isNewSet && currentStore?.id ? {
      options: {
        $: { where: { set: setId, storeId: currentStore.id } }
      }
    } : {}
  );

  // Process real-time data into values and extract group names
  const values: OptionValue[] = React.useMemo(() => {
    if (isNewSet || !data?.options) return [];

    const sortedValues = data.options
      .map(option => ({
        id: option.id,
        value: option.value,
        identifier: option.identifier || `text:${option.value.substring(0, 2).toUpperCase()}`,
        order: option.order || 0,
        group: option.group || 'Group 1'
      }))
      .sort((a, b) => a.order - b.order);

    // Extract unique group names from the data
    const uniqueGroups = [...new Set(sortedValues.map(v => v.group))];
    const extractedGroupNames: {[key: string]: string} = {};

    // Initialize with default groups
    extractedGroupNames['Group 1'] = 'Group 1';
    extractedGroupNames['Group 2'] = 'Group 2';
    extractedGroupNames['Group 3'] = 'Group 3';

    // Add any custom group names from the data
    uniqueGroups.forEach(group => {
      if (group) {
        extractedGroupNames[group] = group;
      }
    });

    setGroupNames(extractedGroupNames);

    return sortedValues;
  }, [data?.options, isNewSet]);

  // For new sets, we'll manage values locally
  const [localValues, setLocalValues] = useState<OptionValue[]>([]);

  // Get the current values (either from real-time data or local state)
  const currentValues = isNewSet ? localValues : values;

  // Group values by group
  const groupedValues = React.useMemo(() => {
    const groups: { [key: string]: OptionValue[] } = {};
    currentValues.forEach(value => {
      const group = value.group || 'Group 1';
      if (!groups[group]) groups[group] = [];
      groups[group].push(value);
    });
    return groups;
  }, [currentValues]);

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
        const transactions = currentValues.map((value, index) => {
          const optionId = id();
          const optionData = {
            set: trimmedSetName,
            value: value.value,
            identifier: value.identifier,
            order: index,
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
        // Update existing set
        const transactions = currentValues.map((value, index) => {
          const optionData = {
            set: trimmedSetName,
            value: value.value,
            identifier: value.identifier,
            order: index,
            group: value.group
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

  const addValue = async () => {
    const trimmedValue = newValueText.trim();
    
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
      group: groupNames[selectedGroup] || selectedGroup
    };

    if (isNewSet) {
      setLocalValues([...localValues, newValue]);
    } else {
      // For existing sets, we'll add to database directly
      try {
        const optionId = id();
        await db.transact([
          db.tx.options[optionId].update({
            set: setId,
            value: newValue.value,
            identifier: newValue.identifier,
            order: newValue.order,
            group: groupNames[selectedGroup] || selectedGroup,
            storeId: currentStore!.id
          })
        ]);
        console.log('✅ Value added successfully');
      } catch (error) {
        console.error('❌ Error adding value:', error);
        Alert.alert('Error', 'Failed to add value');
        return;
      }
    }
    
    setNewValueText('');
  };

  const removeValue = async (valueId: string) => {
    if (isNewSet) {
      setLocalValues(localValues.filter(v => v.id !== valueId));
    } else {
      // For existing sets, delete from database directly
      try {
        await db.transact([db.tx.options[valueId].delete()]);
        console.log('✅ Value deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting value:', error);
        Alert.alert('Error', 'Failed to delete value');
      }
    }
  };

  const updateGroupName = async (oldGroupName: string, newGroupName: string) => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      Alert.alert('Validation Error', 'Group name cannot be empty');
      return;
    }

    if (trimmedName.length > 20) {
      Alert.alert('Validation Error', 'Group name cannot exceed 20 characters');
      return;
    }

    // Update local group names
    const updatedGroupNames = { ...groupNames };
    updatedGroupNames[oldGroupName] = trimmedName;
    setGroupNames(updatedGroupNames);

    // Update selected group if it was the one being edited
    if (selectedGroup === oldGroupName) {
      setSelectedGroup(trimmedName);
    }

    // Update values in database if not a new set
    if (!isNewSet) {
      try {
        const valuesToUpdate = currentValues.filter(v => v.group === oldGroupName);
        if (valuesToUpdate.length > 0) {
          const transactions = valuesToUpdate.map(value =>
            db.tx.options[value.id].update({ group: trimmedName })
          );
          await db.transact(transactions);
          console.log('✅ Group name updated successfully');
        }
      } catch (error) {
        console.error('❌ Error updating group name:', error);
        Alert.alert('Error', 'Failed to update group name');
      }
    } else {
      // Update local values for new sets
      setLocalValues(localValues.map(v =>
        v.group === oldGroupName ? { ...v, group: trimmedName } : v
      ));
    }

    setEditingGroup(null);
  };

  const renderValue = ({ item }: { item: OptionValue }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: 'white',
    }}>
      {/* Value Text */}
      <Text style={{
        flex: 1,
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '400',
      }}>
        {item.value}
      </Text>

      {/* Delete Button */}
      <TouchableOpacity 
        onPress={() => removeValue(item.id)}
        style={{ padding: 8 }}
      >
        <Feather name="x" size={16} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderGroup = (groupName: string, groupValues: OptionValue[]) => (
    <View key={groupName} style={{ marginBottom: 20 }}>
      <TouchableOpacity
        onPress={() => setEditingGroup(groupName)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: '#F8F9FA',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#E5E5EA',
        }}
      >
        {editingGroup === groupName ? (
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: '600',
              color: '#1C1C1E',
              paddingVertical: 0,
              marginRight: 10,
            }}
            value={groupNames[groupName] || groupName}
            onChangeText={(text) => {
              const updatedGroupNames = { ...groupNames };
              updatedGroupNames[groupName] = text;
              setGroupNames(updatedGroupNames);
            }}
            onSubmitEditing={() => updateGroupName(groupName, groupNames[groupName] || groupName)}
            onBlur={() => updateGroupName(groupName, groupNames[groupName] || groupName)}
            autoFocus={true}
            selectTextOnFocus={true}
          />
        ) : (
          <Text style={{
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
            color: '#1C1C1E',
          }}>
            {groupNames[groupName] || groupName} ({groupValues.length})
          </Text>
        )}

        <Feather
          name="edit-2"
          size={14}
          color="#8E8E93"
          style={{ opacity: editingGroup === groupName ? 0 : 1 }}
        />
      </TouchableOpacity>

      {groupValues.map(value => (
        <View key={value.id}>
          {renderValue({ item: value })}
        </View>
      ))}
    </View>
  );

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
        <Text style={{
          fontSize: 13,
          color: '#8E8E93',
          marginBottom: 8,
          fontWeight: '500',
          textTransform: 'uppercase',
        }}>
          Option Set Name
        </Text>
        <TextInput
          style={{
            fontSize: 17,
            color: '#1C1C1E',
            fontWeight: '400',
            paddingVertical: 8,
          }}
          value={currentSetName}
          onChangeText={setCurrentSetName}
          placeholder="Enter option set name"
          placeholderTextColor="#C7C7CC"
          autoFocus={isNewSet}
        />
      </View>

      {/* Add Value Section */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: '#F8F9FA',
      }}>
        <Text style={{
          fontSize: 13,
          color: '#8E8E93',
          marginBottom: 12,
          fontWeight: '500',
          textTransform: 'uppercase',
        }}>
          Add Value
        </Text>
        
        {/* Group Selection */}
        <View style={{
          flexDirection: 'row',
          marginBottom: 12,
          gap: 8,
        }}>
          {Object.keys(groupNames).slice(0, 3).map((groupKey) => (
            <TouchableOpacity
              key={groupKey}
              onPress={() => setSelectedGroup(groupKey)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: selectedGroup === groupKey ? '#007AFF' : 'white',
                borderRadius: 6,
                borderWidth: 1,
                borderColor: selectedGroup === groupKey ? '#007AFF' : '#E1E5E9',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: selectedGroup === groupKey ? 'white' : '#1C1C1E',
              }}>
                {groupNames[groupKey]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Value Input */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
        }}>
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: '#1C1C1E',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E1E5E9',
            }}
            value={newValueText}
            onChangeText={setNewValueText}
            placeholder="Enter value name"
            placeholderTextColor="#8E8E93"
            onSubmitEditing={addValue}
          />
          
          <TouchableOpacity
            onPress={addValue}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: '#007AFF',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Values List */}
      <FlatList
        data={Object.keys(groupedValues)}
        renderItem={({ item: groupName }) => renderGroup(groupName, groupedValues[groupName])}
        keyExtractor={(item) => item}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            paddingVertical: 40,
            alignItems: 'center',
          }}>
            {!isNewSet && isLoading ? (
              <Text style={{
                fontSize: 17,
                color: '#8E8E93',
                textAlign: 'center',
              }}>
                Loading values...
              </Text>
            ) : !isNewSet && error ? (
              <>
                <Text style={{
                  fontSize: 17,
                  color: '#FF3B30',
                  textAlign: 'center',
                }}>
                  Error loading values
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: '#8E8E93',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  Please try again
                </Text>
              </>
            ) : (
              <>
                <Text style={{
                  fontSize: 17,
                  color: '#8E8E93',
                  textAlign: 'center',
                }}>
                  No values yet
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: '#8E8E93',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  Add values using the form above
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}
