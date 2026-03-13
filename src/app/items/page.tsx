import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ItemsPage() {
  const itemCategories = [
    {
      name: 'Poké Balls',
      items: ['Poké Ball', 'Great Ball', 'Ultra Ball', 'Master Ball', 'Quick Ball', 'Timer Ball', 'Dusk Ball', 'Heal Ball'],
      color: 'from-red-400 to-pink-500'
    },
    {
      name: 'Medicine',
      items: ['Potion', 'Super Potion', 'Hyper Potion', 'Max Potion', 'Antidote', 'Burn Heal', 'Ice Heal', 'Awakening'],
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'Battle Items',
      items: ['X Attack', 'X Defense', 'X Speed', 'X Sp. Atk', 'X Sp. Def', 'Guard Spec', 'Dire Hit', 'Focus Energy'],
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'Evolution',
      items: ['Fire Stone', 'Water Stone', 'Thunder Stone', 'Leaf Stone', 'Moon Stone', 'Sun Stone', 'Dawn Stone', 'Shiny Stone'],
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'Held Items',
      items: ['Choice Band', 'Choice Specs', 'Choice Scarf', 'Life Orb', 'Leftovers', 'Expert Belt', 'Muscle Band', 'Wise Glasses'],
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'Rare Items',
      items: ['Rare Candy', 'Master Candy', 'EXP Candy S', 'EXP Candy M', 'EXP Candy L', 'EXP Candy XL', 'Ability Patch', 'Ability Capsule'],
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="pkm-gradient py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-4xl">🎒</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Items Collection
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Browse our extensive collection of items for all Pokémon games. From basic Poké Balls to rare evolution stones.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search items..."
              className="pkm-input flex-1"
            />
            <select className="pkm-input md:w-48">
              <option>All Categories</option>
              {itemCategories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
            <button className="pkm-button-primary">
              Search Items
            </button>
          </div>
        </div>

        {/* Item Categories */}
        {itemCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-2xl">📦</span>
              </div>
              <h2 className="text-2xl font-bold text-green-900">{category.name}</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="pkm-card p-4 hover:scale-105 transition-all duration-300">
                  <div className={`w-full h-20 bg-gradient-to-r ${category.color} rounded-lg mb-3 flex items-center justify-center`}>
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h4 className="text-sm font-semibold text-green-900 text-center mb-1">
                    {item}
                  </h4>
                  <p className="text-xs text-gray-500 text-center">
                    In Stock: {Math.floor(Math.random() * 999) + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Featured Items */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Featured Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Master Ball</h3>
              <p className="text-white/80 mb-4">100% catch rate for any Pokémon</p>
              <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Master Ball
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="w-16 h-16 bg-purple-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Ability Patch</h3>
              <p className="text-white/80 mb-4">Change to hidden ability instantly</p>
              <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Ability Patch
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="w-16 h-16 bg-orange-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🍬</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Rare Candy XL</h3>
              <p className="text-white/80 mb-4">Max level any Pokémon instantly</p>
              <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Rare Candy XL
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}