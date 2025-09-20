import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface MobileTopBarProps {
  onMenuClick: () => void;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export function MobileTopBar({ onMenuClick, rightIcon, onRightIconClick }: MobileTopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 p-4 pt-safe">
      {/* Island container */}
      <div className="mx-auto max-w-sm">
        <div className="flex items-center justify-between bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 shadow-lg">
          {/* Menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-foreground hover:bg-accent/50 transition-colors rounded-xl h-9 w-9"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Brand with logo */}
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/2db14320-f76b-4b9d-978c-1761722e2695.png"
              alt="Chef Logo"
              className="h-7 w-auto"
            />
            <span className="text-foreground font-medium text-base tracking-wide">
              Mon Ami Chef
            </span>
          </div>

          {/* Right icon or spacer for balance */}
          {rightIcon && onRightIconClick ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRightIconClick}
              className="text-foreground hover:bg-accent/50 transition-colors rounded-xl h-9 w-9"
            >
              {rightIcon}
            </Button>
          ) : (
            <div className="w-9"></div>
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileTopBar;
