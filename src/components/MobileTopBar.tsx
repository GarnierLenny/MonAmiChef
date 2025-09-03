import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <header className="md:hidden bg-gradient-to-r from-chef-orange via-chef-yellow to-chef-green border-b border-white/20 shadow-[0_4px_20px_rgba(255,165,0,0.3)] sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 px-4 relative">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-chef-orange/10 via-chef-yellow/10 to-chef-green/10 opacity-50"></div>
        
        {/* Menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="relative z-10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 rounded-full shadow-lg backdrop-blur-sm border border-white/20"
        >
          <Menu className="h-6 w-6 drop-shadow-sm" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Logo with elegant styling */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <img 
              src="/lovable-uploads/2db14320-f76b-4b9d-978c-1761722e2695.png" 
              alt="Chef Logo" 
              className="h-10 w-auto drop-shadow-sm"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-chef-orange/20 to-chef-yellow/20 blur-sm -z-10"></div>
          </div>
        </div>

        {/* Right spacer for centering */}
        <div className="w-10"></div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    </header>
  );
}

export default MobileTopBar;