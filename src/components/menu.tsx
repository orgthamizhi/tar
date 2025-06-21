import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Screen = 'dashboard' | 'sales' | 'reports' | 'products' | 'collections' | 'menu';

interface FullScreenMenuProps {
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
}

export default function FullScreenMenu({ onNavigate, onClose }: FullScreenMenuProps) {
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Sales metrics and analytics',
      icon: '🎈',
      color: 'bg-blue-100',
    },
    {
      id: 'sales',
      title: 'Sales',
      subtitle: 'Track sales performance',
      icon: '💰',
      color: 'bg-green-100',
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Real-time business reports',
      icon: '📈',
      color: 'bg-purple-100',
    },
    {
      id: 'products',
      title: 'Products',
      subtitle: 'Manage your product inventory',
      icon: '📦',
      color: 'bg-orange-100',
    },
    {
      id: 'collections',
      title: 'Collections',
      subtitle: 'Organize products into groups',
      icon: '🏷️',
      color: 'bg-red-100',
    },
  ];

  const handleItemPress = (screenId: string) => {
    onNavigate(screenId as Screen);
  };

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
          {/* Menu Items */}
          <View className="gap-4 mb-8">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item.id)}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <View className="flex-row items-center">
                  <View className={`w-16 h-16 ${item.color} rounded-xl items-center justify-center mr-4`}>
                    <Text className="text-3xl">{item.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-gray-900 mb-1">
                      {item.title}
                    </Text>
                    <Text className="text-gray-600">
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-2xl">›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Options */}
          <View className="gap-4 mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-2">Settings</Text>
            
            <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-lg">⚙️</Text>
                  </View>
                  <Text className="text-base font-medium text-gray-900">App Settings</Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-lg">👤</Text>
                  </View>
                  <Text className="text-base font-medium text-gray-900">Account</Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-lg">❓</Text>
                  </View>
                  <Text className="text-base font-medium text-gray-900">Help & Support</Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
              </View>
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
