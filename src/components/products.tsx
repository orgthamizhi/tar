import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db, formatCurrency } from '../lib/instant';
import ProductFormScreen from './prod-form';
import InventoryAdjustmentScreen from './inventory';
import { createSampleData } from '../lib/sample-data';

interface ProductsScreenProps {
  isGridView?: boolean;
}

export default function ProductsScreen({ isGridView = false }: ProductsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showForm, setShowForm] = useState(false);
  const [showInventoryAdjustment, setShowInventoryAdjustment] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Query products
  const { isLoading, error, data } = db.useQuery({
    products: {}
  });

  const products = data?.products || [];
  const filteredProducts = products.filter((product: any) => {
    const title = product.title || product.name || '';
    const category = product.category || '';
    const brand = product.brand || '';
    const tags = product.tags || '';
    const searchTerm = searchQuery.toLowerCase();

    return title.toLowerCase().includes(searchTerm) ||
           category.toLowerCase().includes(searchTerm) ||
           brand.toLowerCase().includes(searchTerm) ||
           tags.toLowerCase().includes(searchTerm);
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleInventoryAdjustment = (product: any) => {
    setEditingProduct(product);
    setShowInventoryAdjustment(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleCreateSampleData = async () => {
    Alert.alert(
      'Create Sample Data',
      'This will add sample products to your database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            const result = await createSampleData();
            if (result.success) {
              Alert.alert('Success', 'Sample products created successfully!');
            } else {
              Alert.alert('Error', 'Failed to create sample data');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (product: any) => {
    const productName = product.title || product.name || 'this product';
    Alert.alert(
      'Confirm Delete',
      `Delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => db.transact(db.tx.products[product.id].delete()),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  // Show full-screen forms
  if (showForm) {
    return (
      <ProductFormScreen
        product={editingProduct}
        onClose={() => setShowForm(false)}
        onSave={() => {
          // Refresh will happen automatically due to real-time updates
        }}
      />
    );
  }

  if (showInventoryAdjustment) {
    return (
      <InventoryAdjustmentScreen
        product={editingProduct}
        onClose={() => setShowInventoryAdjustment(false)}
        onSave={() => {
          // Refresh will happen automatically due to real-time updates
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar - Exact match to image design */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            {/* Search Icon */}
            <Feather name="search" size={20} color="#6B7280" />

            {/* Search Input */}
            <TextInput
              placeholder="Search all items"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-base text-gray-900 ml-3 mr-3"
              placeholderTextColor="#9CA3AF"
            />

            {/* Add Icon */}
            <TouchableOpacity onPress={handleAddNew}>
              <Feather name="plus" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* Products Grid - Square POS Style */}
      <View className="flex-1">
        {filteredProducts.length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl">📦</Text>
              </View>
              <Text className="text-lg font-medium text-gray-900 mb-2">No products found</Text>
              <Text className="text-gray-500 text-center mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
              </Text>
              {!searchQuery && products.length === 0 && (
                <TouchableOpacity
                  onPress={handleCreateSampleData}
                  className="bg-blue-600 px-6 py-3 rounded-lg mb-4"
                >
                  <Text className="text-white font-medium">Create Sample Products</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            numColumns={isGridView ? 2 : 1}
            key={isGridView ? 'grid' : 'list'} // Force re-render when layout changes
            contentContainerStyle={{ padding: 16 }}
            columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                onPress={() => handleEdit(product)}
                className={`bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 ${
                  isGridView ? '' : 'mx-0'
                }`}
                style={isGridView ? { width: '48%' } : { width: '100%' }}
              >
                {isGridView ? (
                  // Grid View Layout
                  <>
                    {/* Product Image Placeholder */}
                    <View className="w-full h-24 bg-gray-100 rounded-lg mb-3 items-center justify-center">
                      <Text className="text-2xl">📦</Text>
                    </View>

                    {/* Product Info */}
                    <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
                      {product.title || product.name}
                    </Text>

                    <Text className="text-lg font-bold text-gray-900 mb-2">
                      {formatCurrency(product.price || 0)}
                    </Text>

                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-500">Stock</Text>
                      <Text className="text-sm font-medium text-gray-900">{product.stock || 0}</Text>
                    </View>

                    {product.category && (
                      <Text className="text-xs text-gray-400 mb-3">Category: {product.category}</Text>
                    )}
                  </>
                ) : (
                  // List View Layout
                  <View className="flex-row items-center">
                    {/* Product Image Placeholder */}
                    <View className="w-16 h-16 bg-gray-100 rounded-lg mr-4 items-center justify-center">
                      <Text className="text-xl">📦</Text>
                    </View>

                    {/* Product Info */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
                        {product.title || product.name}
                      </Text>
                      <Text className="text-lg font-bold text-gray-900 mb-1">
                        {formatCurrency(product.price || 0)}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm text-gray-500 mr-4">Stock: {product.stock || 0}</Text>
                        {product.category && (
                          <Text className="text-xs text-gray-400">Category: {product.category}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                {isGridView ? (
                  // Grid View Action Buttons
                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="flex-1 bg-blue-50 py-2 rounded-lg items-center"
                      >
                        <Text className="text-blue-600 font-medium text-sm">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleInventoryAdjustment(product);
                        }}
                        className="flex-1 bg-green-50 py-2 rounded-lg items-center"
                      >
                        <Text className="text-green-600 font-medium text-sm">Stock</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(product);
                      }}
                      className="bg-red-50 py-2 rounded-lg items-center"
                    >
                      <Text className="text-red-600 font-medium text-sm">Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // List View Action Buttons (horizontal)
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      className="flex-1 bg-blue-50 py-2 rounded-lg items-center"
                    >
                      <Text className="text-blue-600 font-medium text-sm">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleInventoryAdjustment(product);
                      }}
                      className="flex-1 bg-green-50 py-2 rounded-lg items-center"
                    >
                      <Text className="text-green-600 font-medium text-sm">Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(product);
                      }}
                      className="flex-1 bg-red-50 py-2 rounded-lg items-center"
                    >
                      <Text className="text-red-600 font-medium text-sm">Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
