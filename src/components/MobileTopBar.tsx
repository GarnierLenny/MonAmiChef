import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <header className="md:hidden bg-gradient-to-r from-chef-orange via-chef-yellow to-chef-orange border-b border-chef-orange/20 shadow-[var(--shadow-elegant)] sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/2db14320-f76b-4b9d-978c-1761722e2695.png" 
            alt="Chef Logo" 
            className="h-10 w-auto"
          />
        </div>

        {/* Right spacer for centering */}
        <div className="w-10"></div>
      </div>
    </header>
  );
}

export default MobileTopBar;