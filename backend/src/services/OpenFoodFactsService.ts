/**
 * Service for interacting with OpenFoodFacts APIs
 * - Product API: Get product information by barcode
 * - Prices API: Get price data for products
 */

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  categories_tags?: string[];
}

export interface PriceData {
  id: number;
  product_code: string;
  product_name: string | null;
  price: number;
  currency: string;
  date: string;
  location_osm_id: number;
  product?: OpenFoodFactsProduct;
  location?: {
    osm_name?: string;
    osm_address_country?: string;
  };
}

export interface PricesResponse {
  items: PriceData[];
  page: number;
  pages: number;
  size: number;
  total: number;
}

export interface IngredientPriceEstimate {
  ingredientName: string;
  estimatedPrice: number | null;
  currency: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchedProductName?: string;
  productCode?: string;
  source: 'exact' | 'fuzzy' | 'category' | 'none';
}

export class OpenFoodFactsService {
  private readonly PRODUCT_API_BASE = 'https://world.openfoodfacts.org/api/v2';
  private readonly PRICES_API_BASE = 'https://prices.openfoodfacts.org/api/v1';
  private readonly SEARCH_API_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

  /**
   * Get product information by barcode
   */
  async getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(`${this.PRODUCT_API_BASE}/product/${barcode}.json`);
      const data = (await response.json()) as any;

      if (data.status === 1 && data.product) {
        return {
          code: data.product.code,
          product_name: data.product.product_name,
          brands: data.product.brands,
          image_url: data.product.image_url,
          categories_tags: data.product.categories_tags,
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching product ${barcode}:`, error);
      return null;
    }
  }

  /**
   * Search for products by name
   */
  async searchProducts(query: string, limit: number = 10): Promise<OpenFoodFactsProduct[]> {
    try {
      const params = new URLSearchParams({
        search_terms: query,
        page_size: limit.toString(),
        json: '1',
        fields: 'code,product_name,brands,image_url,categories_tags',
      });

      const response = await fetch(`${this.SEARCH_API_BASE}?${params}`);
      const data = (await response.json()) as any;

      if (data.products && Array.isArray(data.products)) {
        return data.products.map((product: any) => ({
          code: product.code,
          product_name: product.product_name,
          brands: product.brands,
          image_url: product.image_url,
          categories_tags: product.categories_tags,
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error searching products for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get prices for a product by barcode
   */
  async getPricesByBarcode(barcode: string): Promise<PricesResponse | null> {
    try {
      const response = await fetch(`${this.PRICES_API_BASE}/prices?product_code=${barcode}`);
      const data = await response.json();

      return data as PricesResponse;
    } catch (error) {
      console.error(`Error fetching prices for ${barcode}:`, error);
      return null;
    }
  }

  /**
   * Get average price for a product by barcode
   */
  async getAveragePriceByBarcode(
    barcode: string,
    currency: string = 'GBP'
  ): Promise<{ price: number; currency: string; sampleSize: number } | null> {
    try {
      const pricesData = await this.getPricesByBarcode(barcode);

      if (!pricesData || !pricesData.items || pricesData.items.length === 0) {
        return null;
      }

      // Filter by currency and recent prices (last 12 months for better coverage)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const relevantPrices = pricesData.items.filter(
        (item) =>
          item.currency === currency &&
          new Date(item.date) >= twelveMonthsAgo &&
          item.price > 0
      );

      // If no prices in last 12 months, use all prices with matching currency
      const pricesToUse = relevantPrices.length > 0
        ? relevantPrices
        : pricesData.items.filter(item => item.currency === currency && item.price > 0);

      if (pricesToUse.length === 0) {
        return null;
      }

      const averagePrice =
        pricesToUse.reduce((sum, item) => sum + item.price, 0) / pricesToUse.length;

      return {
        price: parseFloat(averagePrice.toFixed(2)),
        currency,
        sampleSize: pricesToUse.length,
      };
    } catch (error) {
      console.error(`Error calculating average price for ${barcode}:`, error);
      return null;
    }
  }

  /**
   * Estimate price for an ingredient by searching OpenFoodFacts
   */
  async estimateIngredientPrice(
    ingredientName: string,
    currency: string = 'GBP'
  ): Promise<IngredientPriceEstimate> {
    try {
      // Clean up ingredient name (remove quantities, cooking instructions)
      const cleanedName = this.cleanIngredientName(ingredientName);

      // Search for products matching the ingredient
      const products = await this.searchProducts(cleanedName, 5);

      if (products.length === 0) {
        return {
          ingredientName,
          estimatedPrice: null,
          currency,
          confidence: 'none',
          source: 'none',
        };
      }

      // Try to get prices for the top matching products
      for (const product of products) {
        const avgPrice = await this.getAveragePriceByBarcode(product.code, currency);

        if (avgPrice && avgPrice.sampleSize > 0) {
          // Determine confidence based on sample size and name match
          let confidence: 'high' | 'medium' | 'low' = 'low';
          if (avgPrice.sampleSize >= 3) {
            confidence = 'high';
          } else if (avgPrice.sampleSize >= 2) {
            confidence = 'medium';
          }

          // Adjust confidence based on name similarity
          const nameSimilarity = this.calculateNameSimilarity(
            cleanedName,
            product.product_name || ''
          );
          if (nameSimilarity < 0.5 && confidence === 'high') {
            confidence = 'medium';
          }

          return {
            ingredientName,
            estimatedPrice: avgPrice.price,
            currency: avgPrice.currency,
            confidence,
            matchedProductName: product.product_name,
            productCode: product.code,
            source: nameSimilarity > 0.7 ? 'exact' : 'fuzzy',
          };
        }
      }

      // If no prices found, return with no price
      return {
        ingredientName,
        estimatedPrice: null,
        currency,
        confidence: 'none',
        source: 'none',
      };
    } catch (error) {
      console.error(`Error estimating price for "${ingredientName}":`, error);
      return {
        ingredientName,
        estimatedPrice: null,
        currency,
        confidence: 'none',
        source: 'none',
      };
    }
  }

  /**
   * Estimate prices for multiple ingredients
   */
  async estimateIngredientsPrices(
    ingredients: string[],
    currency: string = 'GBP'
  ): Promise<IngredientPriceEstimate[]> {
    const estimates: IngredientPriceEstimate[] = [];

    // Process ingredients in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);
      const batchEstimates = await Promise.all(
        batch.map((ingredient) => this.estimateIngredientPrice(ingredient, currency))
      );
      estimates.push(...batchEstimates);

      // Small delay between batches to be respectful to the API
      if (i + batchSize < ingredients.length) {
        await this.delay(500);
      }
    }

    return estimates;
  }

  /**
   * Clean ingredient name to improve search results
   */
  private cleanIngredientName(ingredient: string): string {
    let cleaned = ingredient;

    // Remove cooking instructions (anything after comma or in parentheses)
    cleaned = cleaned.split(',')[0].trim();
    cleaned = cleaned.split('(')[0].trim();

    // Remove quantities at the start - more comprehensive patterns
    cleaned = cleaned.replace(/^\d+(\.\d+)?[\s]*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|kilogram|kilograms|kg|ml|milliliter|milliliters|liter|liters|l|piece|pieces|slice|slices|clove|cloves|can|cans|package|packages|pkg|box|boxes|jar|jars|bottle|bottles)s?\s+/gi, '');

    // Remove fractions and numbers at the start
    cleaned = cleaned.replace(/^[\d./¼½¾⅓⅔⅛⅜⅝⅞\s]+/, '').trim();

    // Remove common adjectives and preparation terms
    const adjectives = ['fresh', 'frozen', 'dried', 'chopped', 'diced', 'sliced', 'minced', 'crushed', 'grated', 'shredded', 'cooked', 'raw', 'organic', 'large', 'small', 'medium', 'whole', 'halved', 'quartered', 'peeled', 'unpeeled', 'ripe', 'green', 'red', 'yellow', 'white', 'black', 'brown'];
    const pattern = new RegExp(`\\b(${adjectives.join('|')})\\b`, 'gi');
    cleaned = cleaned.replace(pattern, '').trim();

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // If we cleaned it down to nothing, return the original
    if (!cleaned || cleaned.length < 2) {
      return ingredient;
    }

    return cleaned;
  }

  /**
   * Calculate simple name similarity (0-1)
   */
  private calculateNameSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Check for exact match
    if (s1 === s2) return 1;

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Simple word overlap calculation
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    let overlap = 0;
    words1.forEach((word) => {
      if (words2.has(word)) overlap++;
    });

    return overlap / Math.max(words1.size, words2.size);
  }

  /**
   * Utility: delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const openFoodFactsService = new OpenFoodFactsService();
