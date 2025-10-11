import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface SubscriptionStatus {
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription(session: Session | null) {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    status: null,
    priceId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    paymentMethodBrand: null,
    paymentMethodLast4: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!session?.user?.id) {
      setSubscription({
        status: null,
        priceId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        paymentMethodBrand: null,
        paymentMethodLast4: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchSubscription = async () => {
      try {
        setSubscription((prev) => ({ ...prev, isLoading: true, error: null }));

        const { data, error } = await supabase
          .from("stripe_user_subscriptions")
          .select("*")
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No subscription found
            setSubscription({
              status: null,
              priceId: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              paymentMethodBrand: null,
              paymentMethodLast4: null,
              isLoading: false,
              error: null,
            });
          } else {
            throw error;
          }
        } else if (data) {
          setSubscription({
            status: data.subscription_status || null,
            priceId: data.price_id || null,
            currentPeriodEnd: data.current_period_end || null,
            cancelAtPeriodEnd: data.cancel_at_period_end || false,
            paymentMethodBrand: data.payment_method_brand || null,
            paymentMethodLast4: data.payment_method_last4 || null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err: any) {
        console.error("Error fetching subscription:", err);
        setSubscription((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || "Failed to load subscription",
        }));
      }
    };

    fetchSubscription();

    // Set up realtime subscription for changes
    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stripe_subscriptions",
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  return subscription;
}

export function getSubscriptionDisplayName(status: string | null): string {
  if (!status || status === "not_started") return "Free Plan";
  if (status === "active" || status === "trialing") return "Premium Plan";
  if (status === "past_due") return "Premium Plan (Payment Due)";
  if (status === "canceled") return "Premium Plan (Canceled)";
  return "Free Plan";
}

export function isSubscriptionActive(status: string | null): boolean {
  return status === "active" || status === "trialing";
}
