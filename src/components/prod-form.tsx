import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { id } from '@instantdb/react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import QuantitySelector from './ui/qty';
import VerticalTabs, { TabContent, FieldGroup, VerticalTab } from './ui/vtabs';
import { db, getCurrentTimestamp } from '../lib/instant';

interface ProductFormScreenProps {
  product?: any;
  onClose: () => void;
  onSave?: () => void;
}

export default function ProductFormScreen({ product, onClose, onSave }: ProductFormScreenProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    // Handle migration from old fields to new fields
    title: product?.title || product?.name || '',
    image: product?.image || product?.imageUrl || '',
    medias: product?.medias || null,
    excerpt: product?.excerpt || product?.description || '',
    notes: product?.notes || '',
    type: product?.type || '',
    category: product?.category || '',
    unit: product?.unit || '',
    price: product?.price?.toString() || '',
    saleprice: product?.saleprice?.toString() || '',
    vendor: product?.vendor || '',
    brand: product?.brand || '',
    options: product?.options || null,
    modifiers: product?.modifiers || null,
    metafields: product?.metafields || null,
    saleinfo: product?.saleinfo || null,
    stores: product?.stores || null,
    pos: product?.pos ?? product?.isActive ?? false,
    website: product?.website ?? false,
    seo: product?.seo || null,
    tags: product?.tags || '',
    cost: product?.cost?.toString() || '',
    qrcode: product?.qrcode || '',
    stock: product?.stock || 0,
    publishAt: product?.publishAt || null,
    publish: product?.publish ?? false,
    promoinfo: product?.promoinfo || null,
    featured: product?.featured ?? false,
    relproducts: product?.relproducts || null,
    sellproducts: product?.sellproducts || null,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Product title is required');
      return;
    }

    setLoading(true);
    try {
      const timestamp = getCurrentTimestamp();
      const productData: any = {
        title: formData.title.trim(),
        updatedAt: timestamp,
        ...(isEditing ? {} : { createdAt: timestamp }),
      };

      // Add optional fields if they have values
      if (formData.image) productData.image = formData.image;
      if (formData.medias) productData.medias = formData.medias;
      if (formData.excerpt) productData.excerpt = formData.excerpt.trim();
      if (formData.notes) productData.notes = formData.notes.trim();
      if (formData.type) productData.type = formData.type.trim();
      if (formData.category) productData.category = formData.category.trim();
      if (formData.unit) productData.unit = formData.unit.trim();
      if (formData.price) productData.price = parseFloat(formData.price) || 0;
      if (formData.saleprice) productData.saleprice = parseFloat(formData.saleprice) || 0;
      if (formData.vendor) productData.vendor = formData.vendor.trim();
      if (formData.brand) productData.brand = formData.brand.trim();
      if (formData.options) productData.options = formData.options;
      if (formData.modifiers) productData.modifiers = formData.modifiers;
      if (formData.metafields) productData.metafields = formData.metafields;
      if (formData.saleinfo) productData.saleinfo = formData.saleinfo;
      if (formData.stores) productData.stores = formData.stores;
      productData.pos = formData.pos;
      productData.website = formData.website;
      if (formData.seo) productData.seo = formData.seo;
      if (formData.tags) productData.tags = formData.tags.trim();
      if (formData.cost) productData.cost = parseFloat(formData.cost) || 0;
      if (formData.qrcode) productData.qrcode = formData.qrcode.trim();
      if (formData.stock !== undefined) productData.stock = formData.stock;
      if (formData.publishAt) productData.publishAt = formData.publishAt;
      productData.publish = formData.publish;
      if (formData.promoinfo) productData.promoinfo = formData.promoinfo;
      productData.featured = formData.featured;
      if (formData.relproducts) productData.relproducts = formData.relproducts;
      if (formData.sellproducts) productData.sellproducts = formData.sellproducts;

      // Also update legacy fields for backward compatibility during migration
      productData.name = formData.title.trim(); // Keep name in sync with title
      if (formData.excerpt) productData.description = formData.excerpt.trim();
      if (formData.image) productData.imageUrl = formData.image;
      productData.isActive = formData.pos; // Map pos to isActive for now

      if (isEditing) {
        await db.transact(db.tx.products[product.id].update(productData));
      } else {
        await db.transact(db.tx.products[id()].update(productData));
      }

      onSave?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Define tabs with their content
  const tabs: VerticalTab[] = [
    {
      id: 'basic',
      label: 'Basic',
      icon: <MaterialIcons name="info-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Basic Information">
          <FieldGroup title="Product Details">
            <Input
              label="Title *"
              placeholder="Product title"
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              variant="outline"
            />
            <Input
              label="Excerpt"
              placeholder="Short description"
              value={formData.excerpt}
              onChangeText={(value) => updateField('excerpt', value)}
              variant="outline"
              multiline
              numberOfLines={2}
            />
            <Input
              label="Notes"
              placeholder="Internal notes"
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              variant="outline"
              multiline
              numberOfLines={3}
            />
          </FieldGroup>

          <FieldGroup title="Classification">
            <Input
              label="Type"
              placeholder="Product type"
              value={formData.type}
              onChangeText={(value) => updateField('type', value)}
              variant="outline"
            />
            <Input
              label="Category"
              placeholder="Product category"
              value={formData.category}
              onChangeText={(value) => updateField('category', value)}
              variant="outline"
            />
            <Input
              label="Unit"
              placeholder="Unit of measure"
              value={formData.unit}
              onChangeText={(value) => updateField('unit', value)}
              variant="outline"
            />
          </FieldGroup>

          <FieldGroup title="Brand & Vendor">
            <Input
              label="Vendor"
              placeholder="Vendor name"
              value={formData.vendor}
              onChangeText={(value) => updateField('vendor', value)}
              variant="outline"
            />
            <Input
              label="Brand"
              placeholder="Brand name"
              value={formData.brand}
              onChangeText={(value) => updateField('brand', value)}
              variant="outline"
            />
            <Input
              label="Tags"
              placeholder="Comma-separated tags"
              value={formData.tags}
              onChangeText={(value) => updateField('tags', value)}
              variant="outline"
            />
          </FieldGroup>
        </TabContent>
      ),
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: <MaterialIcons name="attach-money" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Pricing Information">
          <FieldGroup title="Prices">
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Input
                  label="Price"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => updateField('price', value)}
                  keyboardType="decimal-pad"
                  variant="outline"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Sale Price"
                  placeholder="0.00"
                  value={formData.saleprice}
                  onChangeText={(value) => updateField('saleprice', value)}
                  keyboardType="decimal-pad"
                  variant="outline"
                />
              </View>
            </View>
            <Input
              label="Cost"
              placeholder="0.00"
              value={formData.cost}
              onChangeText={(value) => updateField('cost', value)}
              keyboardType="decimal-pad"
              variant="outline"
            />
          </FieldGroup>
        </TabContent>
      ),
    },
    {
      id: 'media',
      label: 'Media',
      icon: <Feather name="image" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Media & Assets">
          <FieldGroup title="Images & Media">
            <Input
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChangeText={(value) => updateField('image', value)}
              variant="outline"
            />
            <TouchableOpacity className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 items-center">
              <Feather name="upload" size={24} color="#6B7280" />
              <Text className="text-gray-600 mt-2">Upload media files</Text>
              <Text className="text-gray-400 text-sm">Images, videos, or 3D models</Text>
            </TouchableOpacity>
          </FieldGroup>

          <FieldGroup title="QR Code">
            <Input
              label="QR Code"
              placeholder="QR code data"
              value={formData.qrcode}
              onChangeText={(value) => updateField('qrcode', value)}
              variant="outline"
            />
          </FieldGroup>
        </TabContent>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <MaterialIcons name="inventory" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Inventory Management">
          <FieldGroup title="Stock">
            <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-lg">
              <Text className="text-base text-gray-900">Stock Quantity</Text>
              <QuantitySelector
                value={formData.stock}
                onValueChange={(value) => updateField('stock', value)}
                size="medium"
              />
            </View>
            <View className="bg-blue-50 p-4 rounded-lg">
              <Text className="text-sm text-blue-800 font-medium">Stock Status</Text>
              <Text className="text-blue-600 mt-1">
                {formData.stock > 10 ? 'In Stock' : formData.stock > 0 ? 'Low Stock' : 'Out of Stock'}
              </Text>
            </View>
          </FieldGroup>
        </TabContent>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Ionicons name="settings-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Product Settings">
          <FieldGroup title="Availability">
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">POS</Text>
                <Switch
                  value={formData.pos}
                  onValueChange={(value) => updateField('pos', value)}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">Website</Text>
                <Switch
                  value={formData.website}
                  onValueChange={(value) => updateField('website', value)}
                />
              </View>
            </View>
          </FieldGroup>

          <FieldGroup title="Publishing">
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">Published</Text>
                <Switch
                  value={formData.publish}
                  onValueChange={(value) => updateField('publish', value)}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">Featured</Text>
                <Switch
                  value={formData.featured}
                  onValueChange={(value) => updateField('featured', value)}
                />
              </View>
            </View>
          </FieldGroup>
        </TabContent>
      ),
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: <Feather name="settings" size={20} color="#6B7280" />,
      content: (
        <TabContent title="Advanced Settings">
          <FieldGroup title="JSON Data">
            <Text className="text-sm text-gray-600 mb-4">
              Advanced configuration fields for options, modifiers, metadata, and more.
            </Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-sm font-medium text-gray-700 mb-2">Options, Modifiers & Metadata</Text>
              <Text className="text-xs text-gray-500">
                Configure product variants, modifiers, custom fields, SEO data, promotional info, and related products through the API or advanced interface.
              </Text>
            </View>
          </FieldGroup>
        </TabContent>
      ),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 text-base font-medium">Cancel</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <MaterialIcons name="inventory-2" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                {isEditing ? formData.title || 'Edit Product' : 'New Product'}
              </Text>
            </View>

            <Button
              title="Save"
              onPress={handleSave}
              loading={loading}
              size="small"
            />
          </View>
        </View>
      </View>

      {/* Vertical Tabs */}
      <VerticalTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="flex-1"
      />
    </View>
  );
}
