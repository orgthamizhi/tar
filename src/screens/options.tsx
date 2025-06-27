import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getOptionsForSet } from '../lib/crud';
import { useStore } from '../lib/store-context';
import GroupScreen from './group';

interface OptionGroup {
  id: string;
  name: string;
  valueCount: number;
  values: string[];
}

interface OptionsScreenProps {
  visible: boolean;
  optionSetName: string;
  onClose: () => void;
  onSave: () => void;
}

export default function OptionsScreen({ 
  visible, 
  optionSetName, 
  onClose, 
  onSave 
}: OptionsScreenProps) {
  const { currentStore } = useStore();
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<OptionGroup | null>(null);
  const [showGroupScreen, setShowGroupScreen] = useState(false);
  const [totalVariants, setTotalVariants] = useState(0);

  useEffect(() => {
    if (visible && optionSetName) {
      loadGroups();
    }
  }, [visible, optionSetName]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await getOptionsForSet(optionSetName);

      if (result.success && result.options) {
        // Group options by their group field
        const groupedOptions = result.options.reduce((acc, option) => {
          const groupName = option.group || 'Default';
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(option.value || '');
          return acc;
        }, {} as Record<string, string[]>);

        // Convert to array format
        const groupsArray = Object.entries(groupedOptions).map(([name, values], index) => ({
          id: `group-${index}`,
          name,
          valueCount: values.length,
          values: values
        }));

        setGroups(groupsArray);
        
        // Calculate total variants (multiply all group counts)
        const variants = groupsArray.reduce((total, group) => total * Math.max(group.valueCount, 1), 1);
        setTotalVariants(variants);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGroup = (group: OptionGroup) => {
    setSelectedGroup(group);
    setShowGroupScreen(true);
  };

  const handleGroupClose = () => {
    setShowGroupScreen(false);
    setSelectedGroup(null);
    loadGroups(); // Refresh data
  };

  const addGroup = () => {
    // Create new group
    const newGroup: OptionGroup = {
      id: `group-${Date.now()}`,
      name: 'New Option',
      valueCount: 0,
      values: []
    };
    setSelectedGroup(newGroup);
    setShowGroupScreen(true);
  };

  const renderGroupItem = ({ item }: { item: OptionGroup }) => (
    <TouchableOpacity
      onPress={() => openGroup(item)}
      style={{
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Drag Handle */}
      <MaterialIcons 
        name="drag-indicator" 
        size={20} 
        color="#C7C7CC" 
        style={{ marginRight: 12 }}
      />
      
      {/* Group Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 17,
          color: '#000000',
          fontWeight: '400',
          marginBottom: 2,
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 15,
          color: '#8E8E93',
          fontWeight: '400',
        }}>
          ({item.valueCount}) {item.values.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
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
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 17, 
              fontWeight: '600', 
              color: '#000000' 
            }}>
              Options
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: '#8E8E93',
              marginTop: 2
            }}>
              {totalVariants} variants
            </Text>
          </View>
          <TouchableOpacity onPress={addGroup}>
            <MaterialIcons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            style={{ backgroundColor: 'white' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {/* Info Banner */}
          {groups.length >= 3 && (
            <View style={{
              backgroundColor: '#E3F2FD',
              marginHorizontal: 16,
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <MaterialIcons
                name="info-outline"
                size={20}
                color="#1976D2"
                style={{ marginRight: 12 }}
              />
              <Text style={{
                fontSize: 15,
                color: '#1976D2',
                flex: 1,
                lineHeight: 20,
              }}>
                Products can only have 3 options
              </Text>
            </View>
          )}
        </View>

        {/* Group Detail Screen */}
        {selectedGroup && (
          <GroupScreen
            visible={showGroupScreen}
            group={selectedGroup}
            optionSetName={optionSetName}
            onClose={handleGroupClose}
          />
        )}
      </View>
    </Modal>
  );
}
