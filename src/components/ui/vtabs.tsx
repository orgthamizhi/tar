import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export interface VerticalTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface VerticalTabsProps {
  tabs: VerticalTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function VerticalTabs({ tabs, activeTab, onTabChange, className = '' }: VerticalTabsProps) {
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <View className={`flex-1 flex-row ${className}`}>
      {/* Left sidebar with tabs */}
      <View className="w-16 bg-white border-r border-gray-200">
        <ScrollView showsVerticalScrollIndicator={false}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                className={`
                  h-16 items-center justify-center border-b border-gray-200
                  ${isActive ? 'bg-blue-50 border-r-2 border-r-blue-500' : 'bg-transparent'}
                `}
                activeOpacity={0.7}
              >
                <View className={`items-center ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.icon}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Right content area */}
      <View className="flex-1 bg-white">
        {activeTabData && (
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {activeTabData.content}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// Tab content wrapper component for consistent styling
interface TabContentProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function TabContent({ children, title, className = '' }: TabContentProps) {
  return (
    <View className={`p-4 ${className}`}>
      {title && (
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

// Field group component for organizing related fields
interface FieldGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function FieldGroup({ children, title, className = '' }: FieldGroupProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {title && (
        <Text className="text-sm font-medium text-gray-700 mb-3">
          {title}
        </Text>
      )}
      <View className="space-y-3">
        {children}
      </View>
    </View>
  );
}
