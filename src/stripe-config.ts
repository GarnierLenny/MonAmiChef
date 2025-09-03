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
    id: "prod_Si53HWH2IT2A4M",
    priceId: "price_1RmetOIjlR3LvH1zBaQ1xU4O",
    name: "Meal-planner",
    description:
      "Access to premium meal planning features with AI-powered recipe generation and advanced nutritional analysis.",
    mode: "subscription",
    price: 5.0,
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
