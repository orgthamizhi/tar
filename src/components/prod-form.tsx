import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { id } from '@instantdb/react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import QuantitySelector from './ui/qty';
import VerticalTabs, { TabContent, FieldGroup, VerticalTab } from './ui/vtabs';
import R2Image from './ui/r2-image';
import { db, getCurrentTimestamp } from '../lib/instant';
import { MediaManager, MediaItem } from './media';

interface ProductFormScreenProps {
  product?: any;
  onClose: () => void;
  onSave?: () => void;
}

export default function ProductFormScreen({ product, onClose, onSave }: ProductFormScreenProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    // Use only new schema fields - legacy fields removed after migration
    title: product?.title || '',
    image: product?.image || '',
    medias: product?.medias || [],
    excerpt: product?.excerpt || '',
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
    pos: product?.pos ?? false,
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
  const [activeTab, setActiveTab] = useState('core');
  const [imageError, setImageError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = (field: string, value: any) => {
    if (field === 'image') {
      setImageError(false); // Reset image error when image URL changes
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true); // Mark that changes have been made
  };

  const handleMediaChange = useCallback((media: MediaItem[]) => {
    setImageError(false); // Reset image error when media changes
    setFormData(prev => ({
      ...prev,
      medias: media,
      // Update primary image URL for backward compatibility
      image: media.length > 0 ? media[0].url : '',
    }));
    setHasChanges(true); // Mark that changes have been made
  }, []);

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
      if (formData.medias && formData.medias.length > 0) productData.medias = formData.medias;
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

      // Legacy fields removed after migration completion

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
      id: 'core',
      label: 'Core',
      icon: <Ionicons name="cube-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          {/* Notion-style title input */}
          <View style={{ marginTop: 0 }}>
            <TextInput
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: '#000',
                paddingVertical: 12,
                paddingHorizontal: 0,
                borderWidth: 0,
                backgroundColor: 'transparent',
              }}
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder="Product title"
              placeholderTextColor="#999"
            />
          </View>

          {/* Tiles Container */}
          <View style={{ marginTop: 16 }}>
            {/* First Row: Price, Sale Price, Cost */}
            <View style={{ flexDirection: 'row', marginBottom: 1 }}>
              <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRightWidth: 0,
                paddingVertical: 16,
                paddingHorizontal: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                  ${parseFloat(formData.price || '0').toFixed(2)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Price</Text>
              </View>

              <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRightWidth: 0,
                paddingVertical: 16,
                paddingHorizontal: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                  ${parseFloat(formData.saleprice || '0').toFixed(2)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Sale Price</Text>
              </View>

              <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                paddingVertical: 16,
                paddingHorizontal: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                  ${parseFloat(formData.cost || '0').toFixed(2)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Cost</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 8 }} />

            {/* Second Row: Image, QR Code, Stock */}
            <View style={{ flexDirection: 'row', marginBottom: 1 }}>
              {/* Image Tile */}
              <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRightWidth: 0,
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {formData.image && !imageError ? (
                  <R2Image
                    url={formData.image}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('R2Image load error:', error);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('R2Image loaded successfully:', formData.image);
                    }}
                  />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="image" size={32} color="#9CA3AF" />
                    <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                      Image
                    </Text>
                  </View>
                )}
              </View>

              {/* QR Code Tile */}
              <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRightWidth: 0,
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  marginBottom: 8,
                  position: 'relative',
                }}>
                  {/* QR Pattern dots */}
                  <View style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', top: 2, right: 2, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', top: 8, left: 8, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', bottom: 2, left: 2, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', bottom: 2, right: 2, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', bottom: 8, left: 8, width: 4, height: 4, backgroundColor: '#000' }} />
                  <View style={{ position: 'absolute', bottom: 8, right: 8, width: 4, height: 4, backgroundColor: '#000' }} />
                </View>
                <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center' }}>
                  {formData.qrcode || 'QR123456789'}
                </Text>
              </View>

              {/* Stock Tile */}
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                    {formData.stock || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 2 }}>
                    {formData.unit || 'units'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Stock</Text>
              </TouchableOpacity>
            </View>

            {/* Third Row: POS and Website Status */}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRightWidth: 0,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                }}
                onPress={() => updateField('pos', !formData.pos)}
              >
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>POS</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>
                  {formData.pos ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                }}
                onPress={() => updateField('website', !formData.website)}
              >
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Website</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>
                  {formData.website ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TabContent>
      ),
    },
    {
      id: 'metafields',
      label: 'Metafields',
      icon: <MaterialIcons name="numbers" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          <View style={{ margin: -16, padding: 0 }}>
            <View style={{
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              marginHorizontal: 0,
              borderTopWidth: 0
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderTopWidth: 0,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Metafields</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  Select metafields
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TabContent>
      ),
    },
    {
      id: 'categorization',
      label: 'Categorization',
      icon: <Ionicons name="folder-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          <View style={{ margin: -16, padding: 0 }}>
            <View style={{
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              marginHorizontal: 0,
              borderTopWidth: 0
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderTopWidth: 0,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Type</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  {formData.type || 'Physical'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Category</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  {formData.category || 'Select category'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Vendor</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  {formData.vendor || 'Select vendor'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>Brand</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                  {formData.brand || 'Select brand'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TabContent>
      ),
    },
    {
      id: 'media',
      label: 'Media',
      icon: <Ionicons name="image-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          <MediaManager
            initialMedia={formData.medias}
            onMediaChange={handleMediaChange}
            maxItems={10}
            allowMultiple={true}
            prefix="products"
            title=""
            description=""
          />
        </TabContent>
      ),
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: <MaterialIcons name="attach-money" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          <FieldGroup title="Prices">
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Price"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => updateField('price', value)}
                  keyboardType="decimal-pad"
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1 }}>
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
      id: 'inventory',
      label: 'Inventory',
      icon: <Ionicons name="layers-outline" size={20} color="#6B7280" />,
      content: (
        <TabContent title="">
          <FieldGroup title="Stock">
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F9FAFB',
              padding: 16,
              borderRadius: 8
            }}>
              <Text style={{ fontSize: 16, color: '#111827' }}>Stock Quantity</Text>
              <QuantitySelector
                value={formData.stock}
                onValueChange={(value) => updateField('stock', value)}
                size="medium"
              />
            </View>
            <View style={{ backgroundColor: '#EFF6FF', padding: 16, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, color: '#1E40AF', fontWeight: '500' }}>Stock Status</Text>
              <Text style={{ color: '#2563EB', marginTop: 4 }}>
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
        <TabContent title="">
          <FieldGroup title="Availability">
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, color: '#111827' }}>POS</Text>
                <Switch
                  value={formData.pos}
                  onValueChange={(value) => updateField('pos', value)}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, color: '#111827' }}>Website</Text>
                <Switch
                  value={formData.website}
                  onValueChange={(value) => updateField('website', value)}
                />
              </View>
            </View>
          </FieldGroup>

          <FieldGroup title="Publishing">
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, color: '#111827' }}>Published</Text>
                <Switch
                  value={formData.publish}
                  onValueChange={(value) => updateField('publish', value)}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, color: '#111827' }}>Featured</Text>
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
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Vertical Tabs */}
      <VerticalTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="flex-1"
        hasChanges={hasChanges}
        onSave={handleSave}
        onClose={onClose}
        loading={loading}
      />
    </View>
  );
}
