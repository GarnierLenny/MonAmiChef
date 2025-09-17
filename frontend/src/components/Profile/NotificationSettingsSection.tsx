// NotificationSettingsSection.tsx - Email and notification preferences
// Manages user preferences for various types of notifications and communications
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Mail, Bell, MessageSquare, Sparkles } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

// Notification categories with detailed descriptions
const NOTIFICATION_CATEGORIES = [
  {
    id: 'emailNotifications',
    title: 'Essential Notifications',
    description: 'Important account and security updates',
    icon: Mail,
    items: [
      {
        key: 'emailNotifications',
        label: 'Account & Security',
        description: 'Password changes, login alerts, and account updates',
        required: true,
      },
    ],
  },
  {
    id: 'recipeNotifications',
    title: 'Recipe & Cooking',
    description: 'Updates about recipes, cooking tips, and meal planning',
    icon: Bell,
    items: [
      {
        key: 'recipeUpdates',
        label: 'Recipe Updates',
        description: 'New recipes based on your preferences and trending recipes',
        required: false,
      },
      {
        key: 'cookingTips',
        label: 'Cooking Tips',
        description: 'Weekly cooking tips and technique guides',
        required: false,
      },
      {
        key: 'mealPlanReminders',
        label: 'Meal Plan Reminders',
        description: 'Reminders about your upcoming meal plans and prep tasks',
        required: false,
      },
    ],
  },
  {
    id: 'communityNotifications',
    title: 'Community & Social',
    description: 'Interactions with other users and community features',
    icon: MessageSquare,
    items: [
      {
        key: 'communityUpdates',
        label: 'Community Updates',
        description: 'New community features and popular discussions',
        required: false,
      },
      {
        key: 'recipeSharing',
        label: 'Recipe Sharing',
        description: 'When someone shares a recipe with you or comments on yours',
        required: false,
      },
    ],
  },
  {
    id: 'marketingNotifications',
    title: 'Marketing & Promotions',
    description: 'Special offers, new features, and promotional content',
    icon: Sparkles,
    items: [
      {
        key: 'marketingEmails',
        label: 'Promotional Emails',
        description: 'Special offers, new features, and product updates',
        required: false,
      },
      {
        key: 'newsletters',
        label: 'Newsletter',
        description: 'Monthly newsletter with recipes, tips, and app updates',
        required: false,
      },
      {
        key: 'partnerOffers',
        label: 'Partner Offers',
        description: 'Special deals from our cooking and food partners',
        required: false,
      },
    ],
  },
];

interface NotificationSettingsSectionProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

/**
 * NotificationSettingsSection - Comprehensive notification preference management
 *
 * Features:
 * - Categorized notification settings
 * - Required vs optional notifications
 * - Bulk enable/disable by category
 * - Clear descriptions for each notification type
 * - Privacy-focused defaults
 */
export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  profile,
  onUpdate,
}) => {
  // Initialize notification settings from profile or defaults
  const [notifications, setNotifications] = useState({
    emailNotifications: profile?.emailNotifications ?? true,
    marketingEmails: profile?.marketingEmails ?? false,
    recipeUpdates: true,
    cookingTips: true,
    mealPlanReminders: true,
    communityUpdates: false,
    recipeSharing: true,
    newsletters: false,
    partnerOffers: false,
  });

  const [saving, setSaving] = useState(false);

  /**
   * Updates a specific notification setting
   */
  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Toggles all notifications in a category
   */
  const toggleCategory = (category: typeof NOTIFICATION_CATEGORIES[0], enabled: boolean) => {
    const updates = category.items.reduce((acc, item) => {
      if (!item.required) {
        acc[item.key] = enabled;
      }
      return acc;
    }, {} as Record<string, boolean>);

    setNotifications(prev => ({ ...prev, ...updates }));
  };

  /**
   * Saves notification preferences to profile
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(notifications);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Checks if a category is fully enabled
   */
  const isCategoryEnabled = (category: typeof NOTIFICATION_CATEGORIES[0]) => {
    return category.items
      .filter(item => !item.required)
      .every(item => notifications[item.key as keyof typeof notifications]);
  };

  /**
   * Checks if a category is partially enabled
   */
  const isCategoryPartial = (category: typeof NOTIFICATION_CATEGORIES[0]) => {
    const optionalItems = category.items.filter(item => !item.required);
    const enabledCount = optionalItems.filter(item =>
      notifications[item.key as keyof typeof notifications]
    ).length;
    return enabledCount > 0 && enabledCount < optionalItems.length;
  };

  // Check for unsaved changes
  const hasChanges = Object.keys(notifications).some(key => {
    const currentValue = notifications[key as keyof typeof notifications];
    const profileValue = key === 'emailNotifications' ? profile?.emailNotifications :
                        key === 'marketingEmails' ? profile?.marketingEmails :
                        false;
    return currentValue !== (profileValue ?? (key === 'emailNotifications' ? true : false));
  });

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        Customize how you'd like to be notified about updates, recipes, and community activity.
        You can change these settings anytime.
      </div>

      {/* Notification Categories */}
      {NOTIFICATION_CATEGORIES.map((category) => {
        const IconComponent = category.icon;
        const isEnabled = isCategoryEnabled(category);
        const isPartial = isCategoryPartial(category);
        const hasOptionalItems = category.items.some(item => !item.required);

        return (
          <Card key={category.id} className="border border-gray-200">
            <CardContent className="p-6">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{category.title}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Category Toggle - Only show if there are optional items */}
                {hasOptionalItems && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {isPartial ? 'Partial' : isEnabled ? 'All' : 'None'}
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => toggleCategory(category, checked)}
                      className={isPartial ? 'data-[state=checked]:bg-yellow-500' : ''}
                    />
                  </div>
                )}
              </div>

              {/* Individual Notification Items */}
              <div className="space-y-4">
                {category.items.map((item) => {
                  const isChecked = notifications[item.key as keyof typeof notifications];

                  return (
                    <div key={item.key} className="flex items-start justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor={item.key}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {item.label}
                          </Label>
                          {item.required && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>

                      <Switch
                        id={item.key}
                        checked={isChecked}
                        onCheckedChange={(checked) => updateNotification(item.key, checked)}
                        disabled={item.required}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Actions */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Quick Actions</h4>
              <p className="text-sm text-gray-600">Quickly manage all notification settings</p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allOptionalKeys = NOTIFICATION_CATEGORIES.flatMap(cat =>
                    cat.items.filter(item => !item.required).map(item => item.key)
                  );
                  const updates = allOptionalKeys.reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                  }, {} as Record<string, boolean>);
                  setNotifications(prev => ({ ...prev, ...updates }));
                }}
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allOptionalKeys = NOTIFICATION_CATEGORIES.flatMap(cat =>
                    cat.items.filter(item => !item.required).map(item => item.key)
                  );
                  const updates = allOptionalKeys.reduce((acc, key) => {
                    acc[key] = false;
                    return acc;
                  }, {} as Record<string, boolean>);
                  setNotifications(prev => ({ ...prev, ...updates }));
                }}
              >
                Disable All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Section */}
      {hasChanges && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-orange-600">
              You have unsaved changes to your notification preferences.
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
        <strong>Privacy Note:</strong> We respect your privacy and will never sell your email address.
        You can unsubscribe from any category at any time. Required notifications are limited to
        essential account and security updates only.
      </div>
    </div>
  );
};