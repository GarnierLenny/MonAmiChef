import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Search, Calendar, Settings } from "lucide-react";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuSidebar({ isOpen, onClose }: MenuSidebarProps) {
  const menuItems = [
    { icon: Home, label: "Home", value: "home" },
    { icon: Search, label: "Explore", value: "explore" },
    { icon: Calendar, label: "Meal Planning", value: "meal-planning" },
    { icon: Settings, label: "Settings", value: "settings" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              className="justify-start w-full"
              onClick={onClose}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MenuSidebar;
