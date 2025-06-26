import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { updateOption } from '../lib/crud';

interface IdentifierDrawerProps {
  visible: boolean;
  optionId: string;
  currentIdentifier: string;
  onClose: () => void;
  onSave: (identifier: string) => void;
}

export default function IdentifierDrawer({ 
  visible, 
  optionId, 
  currentIdentifier, 
  onClose, 
  onSave 
}: IdentifierDrawerProps) {
  const [selectedType, setSelectedType] = useState<'image' | 'color' | 'label'>('label');
  const [tileLabel, setTileLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tileLabel.trim()) {
      Alert.alert('Error', 'Please enter a tile label');
      return;
    }

    try {
      setSaving(true);
      
      // Create identifier string based on type
      let identifier = '';
      switch (selectedType) {
        case 'image':
          identifier = `image:${tileLabel.trim()}`;
          break;
        case 'color':
          identifier = `color:${tileLabel.trim()}`;
          break;
        case 'label':
          identifier = `label:${tileLabel.trim()}`;
          break;
      }

      const result = await updateOption(optionId, { identifier });
      
      if (result.success) {
        onSave(identifier);
        onClose();
      } else {
        Alert.alert('Error', 'Failed to save identifier');
      }
    } catch (error) {
      console.error('Error saving identifier:', error);
      Alert.alert('Error', 'Failed to save identifier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
          minHeight: 400,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              Edit POS tile
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preview Card */}
          <View style={{
            backgroundColor: '#111827',
            borderRadius: 8,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            marginBottom: 24,
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '600', 
              color: 'white',
              textAlign: 'center' 
            }}>
              {tileLabel.slice(0, 2).toUpperCase() || 'CO'}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#9CA3AF',
              marginTop: 8,
              textAlign: 'center' 
            }}>
              {tileLabel || 'coffee'}
            </Text>
          </View>

          <Text style={{ 
            fontSize: 16, 
            color: '#3B82F6', 
            textAlign: 'center',
            marginBottom: 24 
          }}>
            Edit POS tile
          </Text>

          {/* Details Section */}
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: 16 
          }}>
            Details
          </Text>

          {/* Tile Label Input */}
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
              marginBottom: 24,
            }}
            placeholder="Tile label"
            placeholderTextColor="#9CA3AF"
            value={tileLabel}
            onChangeText={setTileLabel}
          />

          {/* Type Selection */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={() => setSelectedType('image')}
              style={{
                flex: 1,
                backgroundColor: selectedType === 'image' ? '#E5E7EB' : '#F3F4F6',
                paddingVertical: 12,
                alignItems: 'center',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: selectedType === 'image' ? '#111827' : '#6B7280' 
              }}>
                Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedType('color')}
              style={{
                flex: 1,
                backgroundColor: selectedType === 'color' ? '#E5E7EB' : '#F3F4F6',
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: selectedType === 'color' ? '#111827' : '#6B7280' 
              }}>
                Colour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {selectedType === 'image' && (
            <View style={{ gap: 16 }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
              }}>
                <MaterialIcons name="photo-library" size={24} color="#111827" style={{ marginRight: 16 }} />
                <Text style={{ fontSize: 16, color: '#111827' }}>Choose from library</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
              }}>
                <MaterialIcons name="camera-alt" size={24} color="#111827" style={{ marginRight: 16 }} />
                <Text style={{ fontSize: 16, color: '#111827' }}>Take a photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
              }}>
                <MaterialIcons name="delete" size={24} color="#9CA3AF" style={{ marginRight: 16 }} />
                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>Remove image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
