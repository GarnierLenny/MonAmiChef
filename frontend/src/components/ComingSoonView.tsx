import {
  Sparkles,
  Clock,
  Bell,
  Rocket,
  Star,
  ChefHat,
  Heart,
  Zap,
} from "lucide-react";

export default function ComingSoonView() {
  const upcomingFeatures = [
    {
      icon: ChefHat,
      title: "AI Recipe Suggestions",
      description:
        "Smart recommendations based on your cooking history and preferences",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Heart,
      title: "Social Recipe Sharing",
      description:
        "Share your favorite recipes with friends and discover community favorites",
      color: "from-pink-400 to-rose-500",
    },
    {
      icon: Zap,
      title: "Voice Commands",
      description:
        "Cook hands-free with voice-activated recipe instructions and timers",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Star,
      title: "Recipe Collections",
      description:
        "Organize your recipes into custom collections and meal themes",
      color: "from-purple-400 to-violet-500",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Intelligent reminders for meal prep, grocery shopping, and cooking",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: Rocket,
      title: "Mobile App",
      description:
        "Take your recipes anywhere with our dedicated mobile application",
      color: "from-cyan-400 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-full">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Coming Soon
          </h1>

          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're cooking up something amazing! Get ready for exciting new
            features that will revolutionize your culinary experience.
          </p>

          <div className="flex items-center justify-center space-x-2 text-orange-600 mb-12">
            <Clock className="w-6 h-6" />
            <span className="text-lg font-semibold">
              Expected Launch: Q2 2024
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What's Coming Next
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Be the First to Know</h2>

          <p className="text-xl mb-8 opacity-90">
            Join our newsletter to get early access and exclusive updates
          </p>

          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notify Me</span>
            </button>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Development Progress
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                AI Recipe Engine
              </span>
              <div className="flex-1 mx-6 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <span className="text-green-600 font-semibold">85%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                Voice Integration
              </span>
              <div className="flex-1 mx-6 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <span className="text-blue-600 font-semibold">60%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Mobile App</span>
              <div className="flex-1 mx-6 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-400 to-violet-500 h-3 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
              <span className="text-purple-600 font-semibold">40%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Social Features</span>
              <div className="flex-1 mx-6 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-500 h-3 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
              <span className="text-pink-600 font-semibold">25%</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            In the meantime, explore our current features and start creating
            amazing recipes!
          </p>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Back to Recipe Generator
          </button>
        </div>
      </div>
    </div>
  );
}
