import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { r2Config, validateR2Config, generateFileKey, getPublicUrl } from './r2-config';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface MediaFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

class R2Service {
  private client: S3Client | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    if (!validateR2Config()) {
      console.error('R2 configuration is incomplete');
      return;
    }

    this.client = new S3Client({
      region: r2Config.region,
      endpoint: r2Config.endpoint,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
      forcePathStyle: true, // Required for R2
    });
  }

  async uploadFile(file: MediaFile, prefix: string = 'media'): Promise<UploadResult> {
    if (!this.client) {
      return { success: false, error: 'R2 client not initialized' };
    }

    try {
      // Generate unique key for the file
      const key = generateFileKey(file.name, prefix);

      // Read file content - use different approach for React Native
      const response = await fetch(file.uri);

      // For React Native, we need to handle the response differently
      let body: Uint8Array;

      try {
        // Try web approach first
        const buffer = await response.arrayBuffer();
        body = new Uint8Array(buffer);
      } catch (error) {
        // Fallback for React Native - use blob and convert to base64
        try {
          const blob = await response.blob();

          // Use a different approach for React Native
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (data:image/jpeg;base64,)
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Convert base64 to Uint8Array
          const binaryString = atob(base64Data);
          body = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            body[i] = binaryString.charCodeAt(i);
          }
        } catch (blobError) {
          // Final fallback - read as text and convert
          const text = await response.text();
          body = new TextEncoder().encode(text);
        }
      }

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
        Body: body,
        ContentType: file.type,
        ContentLength: body.byteLength,
      });

      await this.client.send(command);

      // Return success with public URL
      const url = getPublicUrl(key);
      return { success: true, url, key };

    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!this.client) {
      console.error('R2 client not initialized');
      return false;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;

    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;

    } catch (error) {
      return false;
    }
  }

  // Upload multiple files
  async uploadFiles(files: MediaFile[], prefix: string = 'media'): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, prefix);
      results.push(result);
    }

    return results;
  }

  // Extract key from URL
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const r2Service = new R2Service();
export default r2Service;
