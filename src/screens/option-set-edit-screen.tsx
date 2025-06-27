import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet, updateOptionSet } from '../lib/crud';
import { useStore } from '../lib/store-context';
import OptionGroupsScreen from './option-groups-screen';

interface OptionSetEditScreenProps {
  navigation: any;
  route: any;
}

export default function OptionSetEditScreen({ navigation, route }: OptionSetEditScreenProps) {
  const { optionSetId, optionSetName } = route.params;
  const { currentStore } = useStore();
  const [editedName, setEditedName] = useState(optionSetName);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGroupsScreen, setShowGroupsScreen] = useState(false);
  const [hasOptions, setHasOptions] = useState(false);

  useEffect(() => {
    checkForOptions();
  }, [optionSetName]);

  const checkForOptions = async () => {
    try {
      setLoading(true);
      const result = await getOptionsForSet(optionSetName);
      setHasOptions(result.success && result.options && result.options.length > 0);
    } catch (error) {
      console.error('Error checking options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Please fill in option set name');
      return;
    }

    try {
      setSaving(true);

      const result = await updateOptionSet(optionSetId, {
        set: editedName.trim(),
        storeId: currentStore?.id || '',
      });

      if (result.success) {
        Alert.alert('Success', 'Option set updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
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

  const handleManageGroups = () => {
    setShowGroupsScreen(true);
  };

  const handleGroupsComplete = () => {
    setShowGroupsScreen(false);
    checkForOptions(); // Refresh to check if options were added
  };

  const canSave = editedName.trim() && !saving;



  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
              Edit Option Set
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 32
            }}>
              Update the name and manage groups and values
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
                marginBottom: 24,
              }}
              placeholder="Option set name"
              placeholderTextColor="#9CA3AF"
              value={editedName}
              onChangeText={setEditedName}
            />

            {/* Manage Groups Button */}
            <TouchableOpacity
              onPress={handleManageGroups}
              style={{
                backgroundColor: '#F3F4F6',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="tune" size={20} color="#374151" />
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#374151',
                marginLeft: 8
              }}>
                Manage Groups & Values
              </Text>
              <View style={{
                backgroundColor: hasOptions ? '#10B981' : '#9CA3AF',
                width: 8,
                height: 8,
                borderRadius: 4,
                marginLeft: 8
              }} />
            </TouchableOpacity>
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
                Option Groups
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: '#0369A1',
              lineHeight: 20
            }}>
              Tap "Manage Groups & Values" to organize your options into up to 3 groups (like Color, Size, Material) with POS-style labels and drag reordering.
            </Text>
          </View>
        </View>

        {/* Option Groups Screen */}
        <OptionGroupsScreen
          visible={showGroupsScreen}
          optionSetName={editedName}
          onClose={() => setShowGroupsScreen(false)}
          onSave={handleGroupsComplete}
        />
      </View>
    </>
  );
}
