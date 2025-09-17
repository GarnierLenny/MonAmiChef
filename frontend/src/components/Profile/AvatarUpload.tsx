// AvatarUpload.tsx - Avatar image upload and management component
// Handles file selection, validation, preview, and upload to Supabase storage
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  displayName?: string | null;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

/**
 * AvatarUpload - Complete avatar management component
 *
 * Features:
 * - File drag & drop support
 * - Image preview before upload
 * - File validation (type, size)
 * - Upload progress indication
 * - Remove avatar functionality
 * - Fallback to user initials
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  displayName,
  onAvatarUpdate,
}) => {
  const { uploadAvatar } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates the selected file for upload
   * Checks file type and size constraints
   */
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, etc.)';
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return 'Image must be smaller than 5MB';
    }

    return null; // File is valid
  };

  /**
   * Processes file selection and initiates upload
   */
  const handleFileSelect = async (file: File) => {
    // Validate file first
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Show preview immediately for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setUploading(true);
    try {
      const newAvatarUrl = await uploadAvatar(file);
      onAvatarUpdate(newAvatarUrl);
      setPreviewUrl(null); // Clear preview since we now have the real URL

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error) {
      setPreviewUrl(null); // Clear preview on error
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handles file input change event
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handles drag and drop events
   */
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  /**
   * Removes the current avatar
   */
  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarUpdate('');
    toast({
      title: 'Avatar removed',
      description: 'Your profile picture has been removed',
    });
  };

  /**
   * Generates user initials for avatar fallback
   */
  const getInitials = (name?: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentImage = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-4">
      {/* Avatar Display and Drop Zone */}
      <div
        className={`
          relative group transition-all duration-200
          ${dragOver ? 'scale-105' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Main Avatar */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={currentImage || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}

            {/* Drag Overlay */}
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-orange-500/80 rounded-full border-4 border-orange-300 border-dashed">
                <Upload className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Upload Instructions */}
          <div className="flex-1">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Profile Picture</h4>
              <p className="text-sm text-gray-600">
                Upload a photo to personalize your profile. Drag and drop or click to browse.
              </p>
              <p className="text-xs text-gray-500">
                Recommended: Square image, max 5MB (JPG, PNG, GIF)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="min-w-[120px]"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </>
          )}
        </Button>

        {/* Remove Button - Only show if there's a current avatar */}
        {currentImage && !uploading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drag and Drop Instructions */}
      {dragOver && (
        <div className="text-center p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg">
          <Upload className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-orange-700 font-medium">Drop your image here</p>
        </div>
      )}
    </div>
  );
};