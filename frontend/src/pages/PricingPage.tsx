import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PricingModal from "@/components/PricingModal";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showCanceledMessage, setShowCanceledMessage] = useState(!!canceled);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (canceled) {
      const timer = setTimeout(() => {
        setShowCanceledMessage(false);
        // Remove the canceled param from URL
        const params = new URLSearchParams(searchParams);
        params.delete("canceled");
        navigate(`/pricing${params.toString() ? `?${params.toString()}` : ""}`, {
          replace: true,
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [canceled, navigate, searchParams]);

  const handleClose = () => {
    setIsPricingModalOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {showCanceledMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Checkout Canceled
                </h3>
                <p className="text-sm text-yellow-700">
                  Your payment was canceled. You can try again whenever you're
                  ready!
                </p>
              </div>
              <button
                onClick={() => setShowCanceledMessage(false)}
                className="text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={handleClose}
        isAuthenticated={!!session}
        onAuthRequired={() => {
          // Redirect to home page which will show auth modal
          navigate("/?auth=required");
        }}
      />
    </div>
  );
}
