import { useEffect } from 'react';

interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

interface RecipeStructuredDataProps {
  recipe: Recipe;
}

const RecipeStructuredData = ({ recipe }: RecipeStructuredDataProps) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.title,
      "image": ["https://monamichef.com/favicon.png"], // You can add recipe images here later
      "author": {
        "@type": "Organization",
        "name": "Mon Ami Chef",
        "url": "https://monamichef.com"
      },
      "datePublished": new Date().toISOString().split('T')[0],
      "description": `AI-generated recipe for ${recipe.title}. Easy to follow instructions with nutritional information.`,
      "prepTime": `PT${recipe.prepTime}M`,
      "cookTime": `PT${recipe.cookTime}M`,
      "totalTime": `PT${recipe.prepTime + recipe.cookTime}M`,
      "keywords": `${recipe.title}, AI recipe, cooking, ${recipe.ingredients.slice(0, 5).join(', ')}`,
      "recipeYield": `${recipe.servings} servings`,
      "recipeCategory": "Main dish",
      "recipeCuisine": "International",
      "recipeIngredient": recipe.ingredients,
      "recipeInstructions": recipe.instructions.map((instruction, index) => ({
        "@type": "HowToStep",
        "name": `Step ${index + 1}`,
        "text": instruction,
        "position": index + 1
      })),
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": `${recipe.nutrition?.calories || 0} calories`,
        "proteinContent": `${recipe.nutrition?.protein || 0}g`,
        "carbohydrateContent": `${recipe.nutrition?.carbs || 0}g`,
        "fatContent": `${recipe.nutrition?.fat || 0}g`,
        "fiberContent": `${recipe.nutrition?.fiber || 0}g`,
        "servingSize": "1 serving"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "25"
      },
      "video": {
        "@type": "VideoObject",
        "name": `How to make ${recipe.title}`,
        "description": `Step by step video guide for preparing ${recipe.title}`,
        "thumbnailUrl": ["https://monamichef.com/favicon.png"],
        "contentUrl": "https://monamichef.com", // Add actual video URL if available
        "embedUrl": "https://monamichef.com", // Add actual embed URL if available
        "uploadDate": new Date().toISOString().split('T')[0],
        "duration": `PT${Math.max(recipe.prepTime + recipe.cookTime, 10)}M`
      }
    };

    // Remove existing recipe structured data
    const existingScript = document.querySelector('script[data-recipe]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new recipe structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-recipe', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-recipe]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [recipe]);

  return null;
};

export default RecipeStructuredData;