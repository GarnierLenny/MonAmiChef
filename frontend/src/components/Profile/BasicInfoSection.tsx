// BasicInfoSection.tsx - Profile basic information management
// Handles user's display name, email, bio, and avatar upload functionality
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from './AvatarUpload';
import { Save, Loader2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

interface BasicInfoSectionProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

/**
 * BasicInfoSection - Manages user's basic profile information
 *
 * Features:
 * - Avatar upload and management
 * - Display name editing
 * - Bio/description editing
 * - Form validation and save state management
 * - Auto-save indication and manual save button
 */
export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  profile,
  onUpdate,
}) => {
  // Local form state for controlled inputs
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
  });

  const [saving, setSaving] = useState(false);

  /**
   * Handles form input changes and updates local state
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Saves the current form data to the backend
   * Provides user feedback during the save process
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles successful avatar upload by updating the profile
   */
  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    await onUpdate({ avatarUrl: newAvatarUrl });
  };

  // Check if form has unsaved changes
  const hasChanges =
    formData.displayName !== (profile?.displayName || '') ||
    formData.bio !== (profile?.bio || '');

  return (
    <div className="space-y-6">
      {/* Avatar Upload Section */}
      <div>
        <Label className="text-base font-medium">Profile Picture</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a profile picture to personalize your account
        </p>
        <AvatarUpload
          currentAvatarUrl={profile?.avatarUrl}
          displayName={profile?.displayName}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>

      <Separator />

      {/* Basic Information Form */}
      <div className="space-y-4">
        {/* Display Name Field */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            maxLength={100}
          />
          <p className="text-sm text-muted-foreground">
            This is how other users will see your name in the community
          </p>
        </div>

        {/* Bio/Description Field */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us a bit about yourself and your cooking interests..."
            maxLength={500}
            rows={4}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Share your cooking interests, dietary goals, or culinary background</span>
            <span>{formData.bio.length}/500</span>
          </div>
        </div>
      </div>

      {/* Save Button - Only show when there are changes */}
      {hasChanges && (
        <>
          <Separator />
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Change Indicator */}
      {hasChanges && (
        <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
          You have unsaved changes. Click "Save Changes" to update your profile.
        </div>
      )}
    </div>
  );
};