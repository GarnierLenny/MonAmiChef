import { useState } from "react";
import { Check, Loader2, Crown, Sparkles, Users } from "lucide-react";
import { products, type Product } from "../stripe-config";
import { supabase } from "../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthRequired,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const handleSubscribe = async (product: Product) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsLoading(true);
    setLoadingProductId(product.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        onAuthRequired();
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: product.priceId,
            mode: product.mode,
            success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/?canceled=true`,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout process");
    } finally {
      setIsLoading(false);
      setLoadingProductId(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-3xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="mt-1">
            Unlock premium features and take your cooking to the next level
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70dvh]">
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader className="text-center pb-4">
                <h3 className="text-xl font-bold mb-2">Free Plan</h3>
                <div className="text-3xl font-bold mb-1">€0</div>
                <p className="text-muted-foreground">Forever free</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Basic recipe generation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">5 recipes per day</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Basic nutritional info</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Simple cooking timers</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter>
                <Button disabled variant="secondary" className="w-full">
                  Current Plan
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plans */}
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 relative hover:border-orange-300 transition-colors"
              >
                <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-400 text-white">
                  <Crown className="w-3.5 h-3.5 mr-1" />
                  Premium
                </Badge>

                <CardHeader className="text-center pb-4 mt-4">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  <p className="text-muted-foreground">per {product.interval}</p>
                  <p className="text-sm mt-2">{product.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {product.name === "Family Plan" ? (
                      <>
                        <li className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            Up to 6 family members
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Unlimited recipe generation
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Family meal planning & scheduling
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Multiple dietary preferences
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Shared recipe collections
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Family grocery lists & budgeting
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Kid-friendly recipe suggestions
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Priority support for families
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            Early access to family features
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Unlimited recipe generation
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Advanced AI recipe suggestions
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Detailed nutritional analysis
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Weekly meal planning
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Smart grocery lists
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Recipe collections & favorites
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">
                            Priority customer support
                          </span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            Early access to new features
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(product)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    {isLoading && loadingProductId === product.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              All plans include a 7-day free trial. Cancel anytime. No hidden
              fees.
            </p>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
