// DietaryPreferencesSection.tsx - Dietary preferences management
// Allows users to select and manage their dietary preferences and restrictions
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Leaf, Fish, Wheat, Heart } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

// Comprehensive list of dietary preferences with descriptions and icons
const DIETARY_OPTIONS = [
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat or fish',
    icon: Leaf,
    category: 'diet',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    description: 'No animal products',
    icon: Leaf,
    category: 'diet',
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    description: 'Fish but no meat',
    icon: Fish,
    category: 'diet',
  },
  {
    id: 'keto',
    label: 'Ketogenic',
    description: 'Low carb, high fat',
    icon: Heart,
    category: 'special',
  },
  {
    id: 'paleo',
    label: 'Paleo',
    description: 'Stone age diet',
    icon: Heart,
    category: 'special',
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    description: 'Mediterranean-style eating',
    icon: Heart,
    category: 'special',
  },
  {
    id: 'gluten-free',
    label: 'Gluten-Free',
    description: 'No gluten-containing grains',
    icon: Wheat,
    category: 'restriction',
  },
  {
    id: 'dairy-free',
    label: 'Dairy-Free',
    description: 'No dairy products',
    icon: Wheat,
    category: 'restriction',
  },
  {
    id: 'low-sodium',
    label: 'Low Sodium',
    description: 'Reduced salt intake',
    icon: Heart,
    category: 'health',
  },
  {
    id: 'low-carb',
    label: 'Low Carb',
    description: 'Reduced carbohydrates',
    icon: Heart,
    category: 'health',
  },
  {
    id: 'low-fat',
    label: 'Low Fat',
    description: 'Reduced fat content',
    icon: Heart,
    category: 'health',
  },
  {
    id: 'high-protein',
    label: 'High Protein',
    description: 'Protein-focused diet',
    icon: Heart,
    category: 'health',
  },
];

// Group options by category for better organization
const CATEGORIES = {
  diet: { label: 'Diet Types', description: 'Primary dietary choices' },
  restriction: { label: 'Dietary Restrictions', description: 'Foods to avoid' },
  special: { label: 'Special Diets', description: 'Specific eating patterns' },
  health: { label: 'Health Goals', description: 'Nutrition-focused preferences' },
};

interface DietaryPreferencesSectionProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

/**
 * DietaryPreferencesSection - Comprehensive dietary preference management
 *
 * Features:
 * - Categorized preference selection
 * - Visual preference indicators
 * - Conflict detection (e.g., vegan + pescatarian)
 * - Batch save functionality
 * - Preference summary display
 */
export const DietaryPreferencesSection: React.FC<DietaryPreferencesSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const currentPreferences = profile?.dietaryPreferences?.preferences || [];
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(currentPreferences);
  const [saving, setSaving] = useState(false);

  /**
   * Handles toggling a dietary preference
   * Includes logic for conflicting preferences
   */
  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => {
      const isCurrentlySelected = prev.includes(preferenceId);
      let newPreferences: string[];

      if (isCurrentlySelected) {
        // Remove the preference
        newPreferences = prev.filter(id => id !== preferenceId);
      } else {
        // Add the preference
        newPreferences = [...prev, preferenceId];

        // Handle conflicts - some diets are mutually exclusive
        if (preferenceId === 'vegan') {
          // Vegan excludes pescatarian and vegetarian (vegan is stricter)
          newPreferences = newPreferences.filter(id => !['pescatarian'].includes(id));
        } else if (preferenceId === 'pescatarian') {
          // Pescatarian excludes vegan
          newPreferences = newPreferences.filter(id => id !== 'vegan');
        }
      }

      return newPreferences;
    });
  };

  /**
   * Saves the selected preferences to the profile
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        dietaryPreferences: {
          ...profile?.dietaryPreferences,
          preferences: selectedPreferences,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Gets the icon component for a preference
   */
  const getPreferenceIcon = (option: typeof DIETARY_OPTIONS[0]) => {
    const IconComponent = option.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  /**
   * Gets the color scheme for a category
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diet':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'restriction':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'special':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'health':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  // Check if there are changes to save
  const hasChanges = JSON.stringify(selectedPreferences.sort()) !==
    JSON.stringify(currentPreferences.sort());

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        Select your dietary preferences to get personalized recipe recommendations.
        These preferences will help us filter recipes and suggest meals that match your dietary needs.
      </div>

      {/* Preference Categories */}
      {Object.entries(CATEGORIES).map(([categoryId, category]) => {
        const categoryOptions = DIETARY_OPTIONS.filter(option => option.category === categoryId);

        return (
          <div key={categoryId} className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">{category.label}</h4>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryOptions.map((option) => {
                const isSelected = selectedPreferences.includes(option.id);

                return (
                  <div
                    key={option.id}
                    className={`
                      relative flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer
                      ${getCategoryColor(option.category)}
                      ${isSelected ? 'ring-2 ring-offset-2 ring-orange-500' : ''}
                    `}
                    onClick={() => handlePreferenceToggle(option.id)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={isSelected}
                      onCheckedChange={() => handlePreferenceToggle(option.id)}
                      className="mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getPreferenceIcon(option)}
                        <Label
                          htmlFor={option.id}
                          className="font-medium cursor-pointer text-gray-900"
                        >
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Preferences Summary */}
      {selectedPreferences.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Selected Preferences:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedPreferences.map((prefId) => {
              const option = DIETARY_OPTIONS.find(opt => opt.id === prefId);
              if (!option) return null;

              return (
                <Badge
                  key={prefId}
                  variant="secondary"
                  className="flex items-center space-x-1 px-3 py-1"
                >
                  {getPreferenceIcon(option)}
                  <span>{option.label}</span>
                </Badge>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            These preferences will be used to filter and recommend recipes for you.
          </p>
        </div>
      )}

      {/* Save Section */}
      {hasChanges && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-orange-600">
              You have unsaved changes to your dietary preferences.
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

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
        <strong>Tip:</strong> You can change these preferences anytime.
        Our AI will learn from your choices and provide better recommendations over time.
      </div>
    </div>
  );
};