import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';

interface CreateScreenProps {
  navigation: any;
  route: any;
}

export default function CreateScreen({ navigation, route }: CreateScreenProps) {
  const { currentStore } = useStore();
  const [optionSetName, setOptionSetName] = useState('');
  const [creating, setCreating] = useState(false);

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
      const result = await createOptionSet({
        set: optionSetName.trim(),
        storeId: currentStore.id,
      });

      if (result.success) {
        Alert.alert('Success', 'Option set created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create option set');
      }
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
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          backgroundColor: 'white',
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#C6C6C8',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ 
              fontSize: 17, 
              color: '#007AFF',
              fontWeight: '400'
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 17, 
            fontWeight: '600', 
            color: '#000000' 
          }}>
            New Option Set
          </Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={{
              fontSize: 17,
              color: canCreate ? '#007AFF' : '#C7C7CC',
              fontWeight: '600'
            }}>
              {creating ? 'Creating...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 24 }}>
          {/* Name Field */}
          <View style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 13,
              color: '#8E8E93',
              marginBottom: 8,
              fontWeight: '400',
            }}>
              Name
            </Text>
            <TextInput
              style={{
                fontSize: 17,
                color: '#000000',
                fontWeight: '400',
                padding: 0,
              }}
              value={optionSetName}
              onChangeText={setOptionSetName}
              placeholder="Option set name"
              placeholderTextColor="#C7C7CC"
              autoFocus
            />
          </View>

          {/* Description */}
          <View style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}>
            <Text style={{
              fontSize: 15,
              color: '#8E8E93',
              lineHeight: 20,
            }}>
              Create an option set to group related product options like size, color, or material.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
