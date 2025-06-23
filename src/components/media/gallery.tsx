import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { r2Service } from '../../lib/r2-service';
import R2Image from '../ui/r2-image';

export interface MediaItem {
  url: string;
  key?: string;
  name?: string;
  type?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  onRemove?: (index: number, item: MediaItem) => void;
  onReorder?: (media: MediaItem[]) => void;
  maxItems?: number;
  editable?: boolean;
  columns?: number;
}

export default function MediaGallery({
  media,
  onRemove,
  onReorder,
  maxItems,
  editable = true,
  columns = 3,
}: MediaGalleryProps) {
  const handleRemove = async (index: number, item: MediaItem) => {
    if (!editable) return;

    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Try to delete from R2 if we have the key
            if (item.key) {
              await r2Service.deleteFile(item.key);
            } else if (item.url) {
              // Extract key from URL
              const key = r2Service.extractKeyFromUrl(item.url);
              if (key) {
                await r2Service.deleteFile(key);
              }
            }
            
            onRemove?.(index, item);
          },
        },
      ]
    );
  };

  const renderMediaItem = (item: MediaItem, index: number) => {
    const isVideo = item.type?.startsWith('video/') || item.url.includes('.mp4');

    return (
      <View key={index} className="relative">
        <View className="aspect-square bg-gray-100 rounded overflow-hidden">
          {isVideo ? (
            <View className="flex-1 items-center justify-center bg-gray-200">
              <MaterialIcons name="play-circle-outline" size={32} color="#6B7280" />
              <Text className="text-xs text-gray-500 mt-1">Video</Text>
            </View>
          ) : (
            <R2Image
              url={item.url}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
        </View>

        {editable && (
          <TouchableOpacity
            onPress={() => handleRemove(index, item)}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
          >
            <MaterialIcons name="close" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!media || media.length === 0) {
    return (
      <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 items-center">
        <MaterialIcons name="photo" size={24} color="#9CA3AF" />
        <Text className="text-gray-500 text-sm mt-1">No media uploaded</Text>
      </View>
    );
  }

  return (
    <View className="space-y-2">
      {maxItems && media.length > maxItems && (
        <View className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Text className="text-amber-800 text-sm">
            Showing {maxItems} of {media.length} media files
          </Text>
        </View>
      )}

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        className="max-h-96"
      >
        <View className="flex-row flex-wrap gap-2">
          {media.slice(0, maxItems).map((item, index) => (
            <View key={index} className="w-[32%]">
              {renderMediaItem(item, index)}
            </View>
          ))}
        </View>
      </ScrollView>
      
      {media.length > 0 && (
        <View className="pt-2">
          <Text className="text-sm text-gray-600">
            {media.length} media file{media.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}
