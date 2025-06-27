import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';
import OptionGroupsScreen from './option-groups-screen';



interface OptionSetCreateScreenProps {
  navigation: any;
  route: any;
}

export default function OptionSetCreateScreen({ navigation, route }: OptionSetCreateScreenProps) {
  const { currentStore } = useStore();
  const [optionSetName, setOptionSetName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showGroupsScreen, setShowGroupsScreen] = useState(false);
  const [createdSetName, setCreatedSetName] = useState('');

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

      // Set the created set name and show groups screen
      setCreatedSetName(optionSetName.trim());
      setShowGroupsScreen(true);
    } catch (error) {
      console.error('Error creating option set:', error);
      Alert.alert('Error', 'Failed to create option set');
    } finally {
      setCreating(false);
    }
  };

  const handleGroupsComplete = () => {
    setShowGroupsScreen(false);
    Alert.alert('Success', 'Option set created successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const canCreate = optionSetName.trim() && !creating;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
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

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 40 }}>
          {/* Option Set Name */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '600',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Create Option Set
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 32
            }}>
              Enter a name for your option set, then add groups and values
            </Text>

            <TextInput
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingHorizontal: 20,
                paddingVertical: 16,
                fontSize: 18,
                color: '#111827',
                textAlign: 'center',
                borderRadius: 8,
              }}
              placeholder="Option set name (e.g., Size, Color)"
              placeholderTextColor="#9CA3AF"
              value={optionSetName}
              onChangeText={setOptionSetName}
              autoFocus
            />
          </View>

          {/* Info Card */}
          <View style={{
            backgroundColor: '#F0F9FF',
            padding: 20,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#BAE6FD',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="info" size={20} color="#0284C7" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0284C7',
                marginLeft: 8
              }}>
                Next Steps
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: '#0369A1',
              lineHeight: 20
            }}>
              After creating the option set, you'll be able to add up to 3 groups (like Color, Size, Material) and manage their values with POS-style labels.
            </Text>
          </View>
        </View>

        {/* Option Groups Screen */}
        <OptionGroupsScreen
          visible={showGroupsScreen}
          optionSetName={createdSetName}
          onClose={() => setShowGroupsScreen(false)}
          onSave={handleGroupsComplete}
        />
      </View>
    </>
  );
}
