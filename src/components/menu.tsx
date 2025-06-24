import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StoreSelector from './store-selector';
import StoreForm from './store-form';
import StoreManagement from './store-mgmt';

type Screen = 'dashboard' | 'sales' | 'reports' | 'products' | 'collections' | 'menu';

interface FullScreenMenuProps {
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
}

export default function FullScreenMenu({ onNavigate, onClose }: FullScreenMenuProps) {
  const insets = useSafeAreaInsets();
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showStoreManagement, setShowStoreManagement] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '🎈',
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: '💰',
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: '📈',
    },
    {
      id: 'products',
      title: 'Products',
      icon: '📦',
    },
    {
      id: 'collections',
      title: 'Collections',
      icon: '🏷️',
    },
  ];

  const handleItemPress = (screenId: string) => {
    onNavigate(screenId as Screen);
  };

  // Show store management screens
  if (showStoreForm) {
    return (
      <StoreForm
        onClose={() => setShowStoreForm(false)}
        onSave={() => setShowStoreForm(false)}
      />
    );
  }

  if (showStoreManagement) {
    return (
      <StoreManagement
        onClose={() => setShowStoreManagement(false)}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-gray-200">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">Menu</Text>
            <TouchableOpacity onPress={onClose} className="px-3 py-2">
              <Text className="text-lg font-medium text-gray-600">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-8">
          {/* Store Selector */}
          <StoreSelector
            onCreateStore={() => setShowStoreForm(true)}
            onEditStores={() => setShowStoreManagement(true)}
          />
          {/* Menu Items */}
          <View className="mb-8">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item.id)}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Text className="text-2xl mr-4">{item.icon}</Text>
                <Text className="flex-1 text-lg font-medium text-gray-900">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xl">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Options */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Settings</Text>

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <Text className="text-lg mr-4">⚙️</Text>
              <Text className="flex-1 text-base font-medium text-gray-900">App Settings</Text>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <Text className="text-lg mr-4">👤</Text>
              <Text className="flex-1 text-base font-medium text-gray-900">Account</Text>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <Text className="text-lg mr-4">❓</Text>
              <Text className="flex-1 text-base font-medium text-gray-900">Help & Support</Text>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pt-6 border-t border-gray-200" style={{ paddingBottom: Math.max(24, insets.bottom + 16) }}>
        <Text className="text-center text-sm text-gray-500">
          Version 1.0.0 • Tar Framework
        </Text>
      </View>
    </View>
  );
}
