export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: "payment" | "subscription";
  price: number;
  currency: string;
  interval?: "month" | "year";
}

export const products: Product[] = [
  {
    id: "premium-plan",
    priceId: "price_1RmetOIjlR3LvH1zBaQ1xU4O",
    name: "Premium",
    description:
      "Access to premium meal planning features with AI-powered recipe generation and advanced nutritional analysis.",
    mode: "subscription",
    price: 2.99,
    currency: "EUR",
    interval: "month",
  },
  {
    id: "family-plan",
    priceId: "price_1SH1tBIjlR3LvH1zzK0sXnHQ",
    name: "Family Plan",
    description:
      "Perfect for families! Share recipes, create family meal plans, and manage multiple dietary preferences all in one place.",
    mode: "subscription",
    price: 5.99,
    currency: "EUR",
    interval: "month",
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find((product) => product.priceId === priceId);
};
