// useProfile.ts - Custom hook for profile management
// Provides centralized profile state management with loading and error handling
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Profile data structure matching the backend schema
export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  dietaryPreferences: {
    preferences: string[];
    restrictions: string[];
  } | null;
  allergies: string[];
  defaultServings: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  emailNotifications: boolean;
  marketingEmails: boolean;
  weekStartsOn: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Default profile structure for new users
const DEFAULT_PROFILE: Partial<Profile> = {
  displayName: null,
  avatarUrl: null,
  bio: null,
  dietaryPreferences: {
    preferences: [],
    restrictions: [],
  },
  allergies: [],
  defaultServings: 4,
  skillLevel: 'beginner',
  emailNotifications: true,
  marketingEmails: false,
  weekStartsOn: 0, // Sunday
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/**
 * Custom hook for managing user profile data
 *
 * Features:
 * - Automatic profile loading on mount
 * - Optimistic updates with error rollback
 * - Toast notifications for success/error states
 * - Loading and error state management
 *
 * @returns Profile management utilities and state
 */
export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the current user's profile from the backend
   * Creates a default profile if none exists
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw fetchError;
      }

      if (existingProfile) {
        // Profile exists, use it
        setProfile(existingProfile);
      } else {
        // No profile exists, create default profile
        const newProfile = {
          ...DEFAULT_PROFILE,
          userId: user.id,
          displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setProfile(createdProfile);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');

      toast({
        title: 'Error Loading Profile',
        description: err.message || 'Failed to load your profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the user's profile with new data
   * Uses optimistic updates for better UX
   *
   * @param updates - Partial profile data to update
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) {
      toast({
        title: 'Error',
        description: 'No profile loaded',
        variant: 'destructive',
      });
      return;
    }

    // Store previous state for rollback
    const previousProfile = { ...profile };

    try {
      // Optimistic update - immediately update UI
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);

      // Send update to backend
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update with server response (in case server modified data)
      setProfile(data);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);

      // Rollback optimistic update
      setProfile(previousProfile);

      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update your profile',
        variant: 'destructive',
      });
    }
  };

  /**
   * Uploads a new avatar image for the user
   *
   * @param file - Image file to upload
   * @returns Promise with the new avatar URL
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Image must be smaller than 5MB');
    }

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatarUrl: publicUrl });

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      throw new Error(err.message || 'Failed to upload avatar');
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};