// ProfilePage.tsx - Main profile management page
// This component provides a comprehensive profile management interface
// with sections for basic info, dietary preferences, allergies, and more
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { BasicInfoSection } from '@/components/Profile/BasicInfoSection';
import { DietaryPreferencesSection } from '@/components/Profile/DietaryPreferencesSection';
import { AllergyManagerSection } from '@/components/Profile/AllergyManagerSection';
import { CookingSettingsSection } from '@/components/Profile/CookingSettingsSection';
import { NotificationSettingsSection } from '@/components/Profile/NotificationSettingsSection';
import { AccountDeletionSection } from '@/components/Profile/AccountDeletionSection';
import { useProfile } from '@/hooks/useProfile';

/**
 * ProfilePage - Complete profile management interface
 *
 * Features:
 * - Basic Information (name, email, avatar)
 * - Dietary Preferences (vegetarian, vegan, etc.)
 * - Allergy Management (searchable multi-select)
 * - Cooking Settings (default servings, skill level)
 * - Notification Preferences (email settings)
 * - Account Deletion (danger zone)
 */
export const ProfilePage: React.FC = () => {
  const { profile, loading, error, updateProfile } = useProfile();

  // Show loading spinner while fetching profile data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading your profile...</span>
      </div>
    );
  }

  // Show error message if profile loading failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Profile
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings, preferences, and dietary requirements
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Primary Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoSection profile={profile} onUpdate={updateProfile} />
              </CardContent>
            </Card>

            {/* Dietary Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>
                  Tell us about your dietary preferences to get personalized recipe recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DietaryPreferencesSection profile={profile} onUpdate={updateProfile} />
              </CardContent>
            </Card>

            {/* Allergies & Restrictions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Allergies & Restrictions</CardTitle>
                <CardDescription>
                  Manage your food allergies and dietary restrictions for safer meal planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllergyManagerSection profile={profile} onUpdate={updateProfile} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Settings */}
          <div className="space-y-6">
            {/* Cooking Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Cooking Preferences</CardTitle>
                <CardDescription>
                  Set your default cooking preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CookingSettingsSection profile={profile} onUpdate={updateProfile} />
              </CardContent>
            </Card>

            {/* Notification Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage your email preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettingsSection profile={profile} onUpdate={updateProfile} />
              </CardContent>
            </Card>

            {/* Danger Zone - Account Deletion */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription className="text-red-600">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountDeletionSection profile={profile} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;