import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { User } from "../types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (user: User) => void;
  authModeParam?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthenticate,
  authModeParam = "login",
}: AuthModalProps) {
  // const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">(authModeParam);
  const isLogin = useMemo(() => authMode === "login", [authMode]);

  // Update authMode when authModeParam changes
  useEffect(() => {
    setAuthMode(authModeParam);
  }, [authModeParam]);


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setIsLoading(false);
      }
      // Note: If successful, user will be redirected to Google, then back to our callback
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
          return;
        }

        if (data.user) {
          onAuthenticate({
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name || email.split("@")[0],
          });
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
          return;
        }

        if (data.user) {
          onAuthenticate({
            id: data.user.id,
            email: data.user.email || "",
            name: name || email.split("@")[0],
          });
          onClose();
        }
      }
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className={`mb-6 ${message.type === "success" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 mt-8"
          >
            {isLoading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <div className="my-6">
          <Separator />
          <div className="relative flex justify-center text-xs uppercase -mt-3">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          variant="outline"
          className="w-full gap-3"
        >
          <GoogleIcon />
          <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
        </Button>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                const newAuthMode = authMode === "login" ? "register" : "login";

                setAuthMode(newAuthMode);
                setMessage(null);
              }}
              className="ml-2 text-primary hover:text-primary/80 font-semibold p-0 h-auto"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
