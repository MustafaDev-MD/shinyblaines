import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MysteryGiftPage() {
  const mysteryGifts = [
    {
      title: 'Shiny Legendary Bundle',
      description: 'Random shiny legendary Pokémon with perfect IVs and exclusive moves',
      rarity: 'Legendary',
      color: 'from-purple-400 to-pink-500',
      available: true
    },
    {
      title: 'Competitive Team Pack',
      description: 'Complete competitive team with strategic movesets and items',
      rarity: 'Rare',
      color: 'from-blue-400 to-cyan-500',
      available: true
    },
    {
      title: 'Mystery Egg Collection',
      description: 'Surprise Pokémon eggs with rare abilities and hidden potential',
      rarity: 'Common',
      color: 'from-green-400 to-emerald-500',
      available: true
    },
    {
      title: 'Event Item Bundle',
      description: 'Exclusive event items and rare consumables',
      rarity: 'Epic',
      color: 'from-orange-400 to-red-500',
      available: true
    },
    {
      title: 'Shiny Starter Set',
      description: 'All regional starters in their shiny variants',
      rarity: 'Special',
      color: 'from-yellow-400 to-orange-500',
      available: false
    },
    {
      title: 'Mythical Collection',
      description: 'Complete set of mythical Pokémon with unique attributes',
      rarity: 'Mythical',
      color: 'from-indigo-400 to-purple-500',
      available: true
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
                <span className="text-4xl">🎁</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mystery Gift Center
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover exclusive rewards, shiny Pokémon, and rare items through our automated gift distribution system
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Active Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Active Mystery Gifts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mysteryGifts.map((gift, index) => (
              <div key={index} className={`pkm-card ${!gift.available ? 'opacity-50' : ''}`}>
                <div className={`w-full h-40 bg-gradient-to-r ${gift.color} rounded-lg mb-6 flex items-center justify-center`}>
                  <span className="text-5xl">📦</span>
                </div>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${gift.rarity === 'Legendary' ? 'bg-purple-100 text-purple-700' : ''}
                    ${gift.rarity === 'Epic' ? 'bg-orange-100 text-orange-700' : ''}
                    ${gift.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' : ''}
                    ${gift.rarity === 'Common' ? 'bg-green-100 text-green-700' : ''}
                    ${gift.rarity === 'Special' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${gift.rarity === 'Mythical' ? 'bg-indigo-100 text-indigo-700' : ''}
                  `}>
                    {gift.rarity}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {gift.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {gift.description}
                </p>
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                    ${gift.available 
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  disabled={!gift.available}
                >
                  {gift.available ? 'Claim Gift' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-green-900 mb-6">How Mystery Gifts Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Select Gift</h3>
              <p className="text-gray-600">Choose from available mystery gifts based on rarity and type</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Connect & Trade</h3>
              <p className="text-gray-600">Connect to our automated trade bots for instant delivery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Receive Items</h3>
              <p className="text-gray-600">Get your mystery gift instantly in your game</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-white/80">Gifts Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-white/80">Bot Availability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-white/80">Free Service</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">1M+</div>
              <div className="text-white/80">Happy Users</div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}