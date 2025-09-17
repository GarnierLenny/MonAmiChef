// CookingSettingsSection.tsx - User cooking preferences and defaults
// Manages cooking skill level, default servings, and other cooking-related settings
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Users, Clock, ChefHat, Target } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

// Skill level definitions with descriptions
const SKILL_LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to cooking, prefer simple recipes',
    icon: '🥄',
    recipes: 'Simple, step-by-step recipes with basic techniques',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Comfortable with basic techniques',
    icon: '👨‍🍳',
    recipes: 'Moderate complexity with some advanced techniques',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced cook, enjoy challenges',
    icon: '👨‍🍳⭐',
    recipes: 'Complex recipes with advanced techniques and ingredients',
  },
] as const;

// Common serving size options
const SERVING_PRESETS = [
  { value: 1, label: '1 person', icon: '👤' },
  { value: 2, label: '2 people', icon: '👥' },
  { value: 4, label: '4 people', icon: '👨‍👩‍👧‍👦' },
  { value: 6, label: '6 people', icon: '👥👥' },
  { value: 8, label: '8+ people', icon: '🎉' },
];

// Timezone options (major timezones)
const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
  { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
  { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' },
];

// Week start options
const WEEK_START_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
];

interface CookingSettingsSectionProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

/**
 * CookingSettingsSection - Comprehensive cooking preferences management
 *
 * Features:
 * - Skill level selection with descriptions
 * - Default serving size slider
 * - Timezone configuration
 * - Week start preference
 * - Visual preference indicators
 * - Batch save functionality
 */
export const CookingSettingsSection: React.FC<CookingSettingsSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const [settings, setSettings] = useState({
    skillLevel: profile?.skillLevel || 'beginner',
    defaultServings: profile?.defaultServings || 4,
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekStartsOn: profile?.weekStartsOn || 0,
  });
  const [saving, setSaving] = useState(false);

  /**
   * Updates a specific setting in local state
   */
  const updateSetting = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Saves all settings to the profile
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(settings);
    } finally {
      setSaving(false);
    }
  };


  // Check for unsaved changes
  const hasChanges =
    settings.skillLevel !== (profile?.skillLevel || 'beginner') ||
    settings.defaultServings !== (profile?.defaultServings || 4) ||
    settings.timezone !== (profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    settings.weekStartsOn !== (profile?.weekStartsOn || 0);

  return (
    <div className="space-y-6">
      {/* Cooking Skill Level */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          Cooking Skill Level
        </Label>
        <p className="text-sm text-muted-foreground">
          This helps us recommend recipes appropriate for your experience level
        </p>

        <div className="space-y-3">
          {SKILL_LEVELS.map((level) => {
            const isSelected = settings.skillLevel === level.value;

            return (
              <Card
                key={level.value}
                className={`
                  cursor-pointer transition-all duration-200
                  ${isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => updateSetting('skillLevel', level.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{level.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{level.label}</h4>
                        {isSelected && (
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Recipes:</strong> {level.recipes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Default Serving Size */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Default Serving Size
        </Label>
        <p className="text-sm text-muted-foreground">
          Recipe portions will be calculated for this number of people by default
        </p>

        {/* Serving Size Slider */}
        <div className="space-y-4">
          <div className="px-3">
            <Slider
              value={[settings.defaultServings]}
              onValueChange={(value) => updateSetting('defaultServings', value[0])}
              max={12}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Current Selection Display */}
          <div className="flex items-center justify-center space-x-3 py-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium">
              {settings.defaultServings} {settings.defaultServings === 1 ? 'person' : 'people'}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {SERVING_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={settings.defaultServings === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('defaultServings', preset.value)}
                className="flex flex-col items-center p-3 h-auto"
              >
                <span className="text-lg mb-1">{preset.icon}</span>
                <span className="text-xs">{preset.value}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Timezone Setting */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timezone
        </Label>
        <p className="text-sm text-muted-foreground">
          Used for meal planning and scheduling features
        </p>

        <Select
          value={settings.timezone}
          onValueChange={(value) => updateSetting('timezone', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Week Start Preference */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Week Starts On
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose which day starts your week for meal planning
        </p>

        <Select
          value={settings.weekStartsOn.toString()}
          onValueChange={(value) => updateSetting('weekStartsOn', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEK_START_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save Section */}
      {hasChanges && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-orange-600">
              You have unsaved changes to your cooking settings.
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
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
        <strong>Note:</strong> These settings help us personalize your recipe recommendations
        and meal planning experience. You can update them anytime.
      </div>
    </div>
  );
};