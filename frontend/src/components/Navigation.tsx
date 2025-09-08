import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Star, Mail, Send, Archive, Trash2 } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, text: "Inbox", href: "#" },
    { icon: Star, text: "Starred", href: "#" },
    { icon: Send, text: "Send email", href: "#" },
    { icon: Archive, text: "Drafts", href: "#" },
  ];

  const secondaryItems = [
    { icon: Mail, text: "All mail", href: "#" },
    { icon: Trash2, text: "Trash", href: "#" },
    { icon: Archive, text: "Spam", href: "#" },
  ];

  return (
    <nav className="w-full bg-background border-b shadow-[var(--shadow-warm)] sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left spacer for centering */}
        <div className="w-10"></div>

        {/* Centered Logo */}
        <div className="flex items-center justify-center">
          <img
            src="/lovable-uploads/e6b9e8eb-d05a-481f-8621-9a0ad7632bce.png"
            alt="Chef Logo"
            className="h-12 w-auto transition-transform hover:scale-105"
          />
        </div>

        {/* Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="chef" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <div className="flex flex-col h-full bg-gradient-to-b from-chef-cream to-background">
              <div className="p-6 border-b">
                <img
                  src="/lovable-uploads/e6b9e8eb-d05a-481f-8621-9a0ad7632bce.png"
                  alt="Chef Logo"
                  className="h-10 w-auto mx-auto"
                />
              </div>

              <div className="flex-1 p-4">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-left hover:bg-chef-orange/10 hover:text-chef-brown transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.text}
                    </Button>
                  ))}
                </div>

                <div className="border-t my-4 border-chef-brown/20"></div>

                <div className="space-y-1">
                  {secondaryItems.map((item) => (
                    <Button
                      key={item.text}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-left hover:bg-chef-green/10 hover:text-chef-brown transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navigation;
