import { Compass, TrendingUp, Star, Clock, Users, Heart } from "lucide-react";

export default function ExploreView() {
  const trendingRecipes = [
    {
      id: 1,
      title: "Mediterranean Quinoa Bowl",
      rating: 4.8,
      time: 25,
      difficulty: "Easy",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      title: "Korean BBQ Tacos",
      rating: 4.9,
      time: 35,
      difficulty: "Medium",
      image:
        "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      title: "Vegan Buddha Bowl",
      rating: 4.7,
      time: 20,
      difficulty: "Easy",
      image:
        "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 4,
      title: "Spicy Thai Curry",
      rating: 4.6,
      time: 40,
      difficulty: "Medium",
      image:
        "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const cuisineCategories = [
    {
      name: "Italian",
      count: 245,
      color: "from-red-400 to-red-600",
      flag: "🇮🇹",
    },
    {
      name: "Asian",
      count: 189,
      color: "from-yellow-400 to-orange-500",
      flag: "🥢",
    },
    {
      name: "Mexican",
      count: 156,
      color: "from-green-400 to-green-600",
      flag: "🇲🇽",
    },
    {
      name: "Mediterranean",
      count: 134,
      color: "from-blue-400 to-blue-600",
      flag: "🇬🇷",
    },
    {
      name: "Indian",
      count: 98,
      color: "from-orange-400 to-red-500",
      flag: "🇮🇳",
    },
    {
      name: "French",
      count: 87,
      color: "from-purple-400 to-purple-600",
      flag: "🇫🇷",
    },
  ];

  const quickFilters = [
    { name: "Under 30 min", icon: Clock, count: 342 },
    { name: "Vegetarian", icon: Heart, count: 198 },
    { name: "High Protein", icon: TrendingUp, count: 156 },
    { name: "Family Friendly", icon: Users, count: 234 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Compass className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold">Explore Recipes</h1>
            <p className="text-orange-100 text-lg">
              Discover amazing dishes from around the world
            </p>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Filters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.name}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-orange-300"
              >
                <Icon className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900">{filter.name}</h3>
                <p className="text-sm text-gray-600">{filter.count} recipes</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Recipes */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Trending This Week
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{recipe.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.time}m</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.difficulty === "Easy"
                        ? "bg-green-100 text-green-700"
                        : recipe.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cuisine Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse by Cuisine
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cuisineCategories.map((cuisine) => (
            <button
              key={cuisine.name}
              className={`bg-gradient-to-br ${cuisine.color} p-6 rounded-xl text-white hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
            >
              <div className="text-3xl mb-2">{cuisine.flag}</div>
              <h3 className="font-bold text-lg">{cuisine.name}</h3>
              <p className="text-sm opacity-90">{cuisine.count} recipes</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
