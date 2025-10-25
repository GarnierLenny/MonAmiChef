import ExamplePrompts from './onboarding/ExamplePrompts';

interface ChatPlaceholderProps {
  onPromptClick?: (prompt: string) => void;
}

export default function ChatPlaceholder({ onPromptClick }: ChatPlaceholderProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700 px-4 bg-orange-50 py-6 overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-6 md:space-y-8">
        {/* App Logo with subtle glow - More compact */}
        <div className="flex justify-center animate-in zoom-in duration-500 delay-100">
          <div className="relative">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-orange-400/10 rounded-full blur-2xl" />

            {/* Logo - Smaller size */}
            <div className="relative">
              <img
                src="/favicon.png"
                alt="MonAmiChef"
                className="w-20 h-20 md:w-28 md:h-28 opacity-40 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Welcome Text - More compact */}
        <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-200 text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700">
            What are we cooking today?
          </h2>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            Tell me what you have or what you're craving
          </p>
        </div>

        {/* Example Prompts - Scrollable container */}
        {onPromptClick && (
          <div className="animate-in slide-in-from-bottom duration-500 delay-300 w-full">
            <ExamplePrompts onPromptClick={onPromptClick} />
          </div>
        )}
      </div>
    </div>
  );
}
