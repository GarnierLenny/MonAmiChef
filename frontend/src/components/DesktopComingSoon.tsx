import { useEffect, useState } from "react";

interface DesktopComingSoonProps {
  children: React.ReactNode;
}

const DesktopComingSoon = ({ children }: DesktopComingSoonProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Consider desktop as screen width >= 1024px (lg breakpoint in Tailwind)
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isDesktop) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="flex justify-center">
            <img
              src="/favicon.png"
              alt="Mon Ami Chef Logo"
              className="w-32 h-32 object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Desktop Version Coming Soon
            </h1>
            <p className="text-xl text-gray-600">
              We're cooking up something special for desktop users!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-gray-800">
                In the meantime...
              </h2>
              <p className="text-gray-600">
                For the best experience, please access Mon Ami Chef on your mobile device or tablet.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Our mobile app is fully optimized and ready to help you create amazing meals!
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>Thank you for your patience while we perfect the desktop experience.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopComingSoon;
