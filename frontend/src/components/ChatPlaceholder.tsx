export default function ChatPlaceholder() {
  return (
    <div className="w-screen h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700 px-4 bg-orange-50">
        {/* App Logo with subtle glow */}
        <div className="flex justify-center animate-in zoom-in duration-500 delay-100">
          <div className="relative">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-orange-400/10 rounded-full blur-3xl" />

            {/* Logo */}
            <div className="relative">
              <img
                src="/favicon.png"
                alt="MonAmiChef"
                className="w-28 h-28 md:w-36 md:h-36 opacity-40 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3 animate-in slide-in-from-bottom duration-500 delay-200 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
            What are we cooking today?
          </h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md mx-auto">
            Tell me what you have or what you're craving
          </p>
        </div>
    </div>
  );
}
