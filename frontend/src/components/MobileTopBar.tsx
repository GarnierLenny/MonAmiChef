import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface MobileTopBarProps {
  onMenuClick: () => void;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  title?: string;
}

export function MobileTopBar({
  onMenuClick,
  rightIcon,
  onRightIconClick,
  title = "Mon Ami Chef",
}: MobileTopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 px-2 bg-orange-50 pt-safe">
      {/* Island container */}
      <div className="mx-auto max-w-sm">
        <div className="flex items-center justify-between rounded-2xl py-1">
          {/* Menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-mobile-menu
            className="text-foreground hover:bg-accent/50 transition-colors rounded-xl h-9 w-9 mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Brand with logo */}
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium text-sm tracking-wide">
              {title}
            </span>
          </div>

          {/* Right icon or spacer for balance */}
          {rightIcon && onRightIconClick ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRightIconClick}
              data-preferences-button
              className="text-foreground hover:bg-accent/50 transition-colors rounded-xl h-9 w-9 mobile-preferences-button"
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
