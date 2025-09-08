import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-chef-cream to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-chef-orange via-chef-yellow to-chef-green bg-clip-text text-transparent">
              Welcome to Chef's Corner
            </h1>
            <p className="text-xl text-chef-brown/80 leading-relaxed">
              Your culinary journey starts here! Discover amazing recipes,
              cooking tips, and connect with fellow food enthusiasts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-chef-orange/20 shadow-[var(--shadow-elegant)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-chef-orange to-chef-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-semibold text-chef-brown mb-2">
                Expert Recipes
              </h3>
              <p className="text-chef-brown/70">
                Curated recipes from professional chefs around the world
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-chef-green/20 shadow-[var(--shadow-elegant)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-chef-green to-chef-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥗</span>
              </div>
              <h3 className="text-xl font-semibold text-chef-brown mb-2">
                Fresh Ingredients
              </h3>
              <p className="text-chef-brown/70">
                Learn about seasonal ingredients and where to find them
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-chef-brown/20 shadow-[var(--shadow-elegant)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-chef-brown to-chef-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-chef-brown mb-2">
                Cooking Tips
              </h3>
              <p className="text-chef-brown/70">
                Master techniques and elevate your culinary skills
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
