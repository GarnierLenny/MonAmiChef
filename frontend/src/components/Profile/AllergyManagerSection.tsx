// AllergyManagerSection.tsx - Food allergy and intolerance management
// Provides a searchable interface for managing food allergies and intolerances
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, AlertTriangle, Search, Save } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

// Comprehensive list of common allergens and food intolerances
const COMMON_ALLERGENS = [
  // Major allergens (FDA recognized)
  { id: 'milk', label: 'Milk/Dairy', category: 'major', severity: 'high' },
  { id: 'eggs', label: 'Eggs', category: 'major', severity: 'high' },
  { id: 'fish', label: 'Fish', category: 'major', severity: 'high' },
  { id: 'shellfish', label: 'Shellfish', category: 'major', severity: 'high' },
  { id: 'tree-nuts', label: 'Tree Nuts', category: 'major', severity: 'high' },
  { id: 'peanuts', label: 'Peanuts', category: 'major', severity: 'high' },
  { id: 'wheat', label: 'Wheat', category: 'major', severity: 'high' },
  { id: 'soy', label: 'Soy', category: 'major', severity: 'high' },
  { id: 'sesame', label: 'Sesame', category: 'major', severity: 'high' },

  // Common intolerances
  { id: 'lactose', label: 'Lactose', category: 'intolerance', severity: 'medium' },
  { id: 'gluten', label: 'Gluten', category: 'intolerance', severity: 'medium' },
  { id: 'fructose', label: 'Fructose', category: 'intolerance', severity: 'medium' },
  { id: 'histamine', label: 'Histamine', category: 'intolerance', severity: 'medium' },

  // Specific foods
  { id: 'avocado', label: 'Avocado', category: 'food', severity: 'low' },
  { id: 'tomatoes', label: 'Tomatoes', category: 'food', severity: 'low' },
  { id: 'strawberries', label: 'Strawberries', category: 'food', severity: 'low' },
  { id: 'citrus', label: 'Citrus Fruits', category: 'food', severity: 'low' },
  { id: 'mushrooms', label: 'Mushrooms', category: 'food', severity: 'low' },
  { id: 'onions', label: 'Onions', category: 'food', severity: 'low' },
  { id: 'garlic', label: 'Garlic', category: 'food', severity: 'low' },
  { id: 'corn', label: 'Corn', category: 'food', severity: 'low' },
  { id: 'chocolate', label: 'Chocolate', category: 'food', severity: 'low' },
  { id: 'coffee', label: 'Coffee', category: 'food', severity: 'low' },

  // Additives
  { id: 'msg', label: 'MSG (Monosodium Glutamate)', category: 'additive', severity: 'medium' },
  { id: 'sulfites', label: 'Sulfites', category: 'additive', severity: 'medium' },
  { id: 'artificial-sweeteners', label: 'Artificial Sweeteners', category: 'additive', severity: 'low' },
  { id: 'food-coloring', label: 'Artificial Food Coloring', category: 'additive', severity: 'low' },
];

interface AllergyManagerSectionProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

/**
 * AllergyManagerSection - Comprehensive allergy and intolerance management
 *
 * Features:
 * - Searchable allergen database
 * - Custom allergy addition
 * - Severity level indicators
 * - Category-based organization
 * - Quick removal functionality
 * - Safety warnings for major allergens
 */
export const AllergyManagerSection: React.FC<AllergyManagerSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const currentAllergies = profile?.allergies || [];
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(currentAllergies);
  const [customAllergen, setCustomAllergen] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  /**
   * Adds an allergen to the selected list
   */
  const addAllergen = (allergenId: string) => {
    if (!selectedAllergies.includes(allergenId)) {
      setSelectedAllergies(prev => [...prev, allergenId]);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  /**
   * Removes an allergen from the selected list
   */
  const removeAllergen = (allergenId: string) => {
    setSelectedAllergies(prev => prev.filter(id => id !== allergenId));
  };

  /**
   * Adds a custom allergen
   */
  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim();
    if (trimmed && !selectedAllergies.includes(trimmed)) {
      setSelectedAllergies(prev => [...prev, trimmed]);
      setCustomAllergen('');
    }
  };

  /**
   * Saves the allergy list to the profile
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ allergies: selectedAllergies });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Gets display information for an allergen
   */
  const getAllergenInfo = (allergenId: string) => {
    const knownAllergen = COMMON_ALLERGENS.find(a => a.id === allergenId);
    return knownAllergen || {
      id: allergenId,
      label: allergenId,
      category: 'custom',
      severity: 'medium',
    };
  };

  /**
   * Gets the color scheme for severity levels
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * Filters allergens based on search query
   */
  const filteredAllergens = COMMON_ALLERGENS.filter(allergen =>
    allergen.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedAllergies.includes(allergen.id)
  );

  // Group allergens by category for display
  const allergensByCategory = selectedAllergies.reduce((acc, allergenId) => {
    const info = getAllergenInfo(allergenId);
    if (!acc[info.category]) acc[info.category] = [];
    acc[info.category].push(info);
    return acc;
  }, {} as Record<string, typeof COMMON_ALLERGENS>);

  const hasChanges = JSON.stringify(selectedAllergies.sort()) !==
    JSON.stringify(currentAllergies.sort());

  const hasMajorAllergens = selectedAllergies.some(id =>
    getAllergenInfo(id).severity === 'high'
  );

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        Add your food allergies and intolerances to ensure recipe recommendations
        are safe for you. This information will be used to filter out recipes
        containing these ingredients.
      </div>

      {/* Add Allergen Section */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Add Allergies & Intolerances</Label>

        <div className="flex gap-2">
          {/* Search from Known Allergens */}
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start">
                <Search className="h-4 w-4 mr-2" />
                Search common allergens...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search allergens..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandEmpty>No allergens found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {filteredAllergens.map((allergen) => (
                    <CommandItem
                      key={allergen.id}
                      onSelect={() => addAllergen(allergen.id)}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{allergen.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {allergen.category} • {allergen.severity} severity
                        </div>
                      </div>
                      <Plus className="h-4 w-4" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Add Custom Allergen */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom allergen..."
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAllergen();
              }
            }}
          />
          <Button
            onClick={addCustomAllergen}
            disabled={!customAllergen.trim()}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Allergies Display */}
      {selectedAllergies.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Your Allergies & Intolerances</Label>

          {/* Major Allergen Warning */}
          {hasMajorAllergens && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Important Safety Notice</p>
                <p className="text-sm text-red-700">
                  You have marked major allergens. We'll exclude recipes containing these
                  ingredients, but always double-check ingredient lists before cooking.
                </p>
              </div>
            </div>
          )}

          {/* Allergies by Category */}
          {Object.entries(allergensByCategory).map(([category, allergens]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize">
                {category === 'major' ? 'Major Allergens' :
                 category === 'intolerance' ? 'Intolerances' :
                 category === 'food' ? 'Specific Foods' :
                 category === 'additive' ? 'Additives' :
                 'Custom'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => (
                  <Badge
                    key={allergen.id}
                    variant="outline"
                    className={`
                      flex items-center space-x-2 px-3 py-1
                      ${getSeverityColor(allergen.severity)}
                    `}
                  >
                    <span>{allergen.label}</span>
                    <button
                      onClick={() => removeAllergen(allergen.id)}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {/* Severity Legend */}
          <div className="text-xs text-muted-foreground bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-4">
              <span>Severity levels:</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedAllergies.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">No allergies added yet</p>
          <p className="text-sm text-gray-500">
            Add your food allergies to get safer recipe recommendations
          </p>
        </div>
      )}

      {/* Save Section */}
      {hasChanges && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-orange-600">
              You have unsaved changes to your allergy list.
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
                  Save Allergies
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};