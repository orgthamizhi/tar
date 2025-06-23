import React, { useState, useEffect } from 'react';
import { Image, View, Text, ImageProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { r2Service } from '../../lib/r2-service';

interface R2ImageProps extends Omit<ImageProps, 'source'> {
  url: string;
  fallback?: React.ReactNode;
  onError?: (error: any) => void;
  onLoad?: () => void;
}

export default function R2Image({ 
  url, 
  fallback, 
  onError, 
  onLoad, 
  style,
  ...props 
}: R2ImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!url) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Check if it's already a signed URL or public URL
        if (url.includes('X-Amz-Algorithm') || url.includes('Signature')) {
          // Already a signed URL
          setSignedUrl(url);
        } else {
          // Extract key from URL and generate signed URL
          const key = r2Service.extractKeyFromUrl(url);
          if (key) {
            const signed = await r2Service.getSignedUrl(key);
            setSignedUrl(signed);
          } else {
            // Fallback to original URL
            setSignedUrl(url);
          }
        }
      } catch (err) {
        console.error('Failed to load signed URL:', err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    loadSignedUrl();
  }, [url]);

  if (loading) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        <MaterialIcons name="image" size={48} color="#9CA3AF" />
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (error || !signedUrl) {
    return fallback || (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        <MaterialIcons name="broken-image" size={48} color="#EF4444" />
        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>Failed to load</Text>
      </View>
    );
  }

  return (
    <Image
      {...props}
      source={{ uri: signedUrl }}
      style={style}
      onError={(e) => {
        console.error('Image load error:', e.nativeEvent);
        setError(true);
        onError?.(e);
      }}
      onLoad={() => {
        console.log('Image loaded successfully:', signedUrl);
        onLoad?.();
      }}
    />
  );
}
