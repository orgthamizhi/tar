import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MediaPicker from './picker';
import MediaGallery, { MediaItem } from './gallery';
import { UploadResult } from '../../lib/r2-service';

interface MediaManagerProps {
  initialMedia?: MediaItem[];
  onMediaChange?: (media: MediaItem[]) => void;
  maxItems?: number;
  allowMultiple?: boolean;
  prefix?: string;
  title?: string;
  description?: string;
}

export default function MediaManager({
  initialMedia = [],
  onMediaChange,
  maxItems = 10,
  allowMultiple = true,
  prefix = 'products',
  title = 'Media Files',
  description = 'Upload images and videos for this product',
}: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const onMediaChangeRef = useRef(onMediaChange);

  // Update ref when callback changes
  useEffect(() => {
    onMediaChangeRef.current = onMediaChange;
  }, [onMediaChange]);

  // Only update media when initialMedia actually changes
  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  // Helper function to update media and notify parent
  const updateMedia = (newMedia: MediaItem[]) => {
    setMedia(newMedia);
    onMediaChangeRef.current?.(newMedia);
  };

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadComplete = (result: UploadResult) => {
    setUploading(false);

    if (result.success && result.url) {
      const newMediaItem: MediaItem = {
        url: result.url,
        key: result.key,
        type: 'image/jpeg', // Default, could be enhanced to detect actual type
      };

      const newMedia = (() => {
        if (!allowMultiple) {
          return [newMediaItem];
        }

        if (maxItems && media.length >= maxItems) {
          return media; // Don't add if at max capacity
        }

        return [...media, newMediaItem];
      })();

      updateMedia(newMedia);
    }
  };

  const handleRemoveMedia = (index: number, item: MediaItem) => {
    const newMedia = media.filter((_, i) => i !== index);
    updateMedia(newMedia);
  };

  const canUploadMore = !maxItems || media.length < maxItems;
  const showPicker = canUploadMore && (allowMultiple || media.length === 0);

  return (
    <View className="space-y-4">
      {/* Header - only show if title or description provided */}
      {(title || description) && (
        <View>
          {title && <Text className="text-base font-medium text-gray-900 mb-1">{title}</Text>}
          {description && (
            <Text className="text-sm text-gray-600">{description}</Text>
          )}
        </View>
      )}

      {/* Media Gallery */}
      {media.length > 0 && (
        <MediaGallery
          media={media}
          onRemove={handleRemoveMedia}
          maxItems={maxItems}
          editable={true}
        />
      )}

      {/* Upload Section */}
      {showPicker && (
        <MediaPicker
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          allowMultiple={allowMultiple}
          mediaTypes="Images"
          prefix={prefix}
          disabled={uploading || !canUploadMore}
        />
      )}

      {/* Status Messages */}
      {maxItems && media.length >= maxItems && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Text className="text-blue-800 text-sm">
            Maximum of {maxItems} media files reached
          </Text>
        </View>
      )}

      {uploading && (
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <Text className="text-gray-700 text-sm">
            Uploading media to cloud storage...
          </Text>
        </View>
      )}
    </View>
  );
}
