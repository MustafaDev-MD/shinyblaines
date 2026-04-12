import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LastPremiumPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Last Premium Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Exclusive premium items and Pokémon
          </p>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Premium</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="w-full h-40 bg-yellow-400 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Legendary Pokémon</h3>
                <p className="text-white/90 mb-4">Ultra-rare collection with special abilities</p>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Purchase with Stripe
                </button>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="w-full h-40 bg-blue-400 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Items</h3>
                <p className="text-white/90 mb-4">Exclusive gear and rare items</p>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Purchase with Stripe
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="w-full h-48 bg-gradient-to-r from-gold-400 to-yellow-500"></div>
                <div className="p-6">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold mb-2">
                    PREMIUM
                  </span>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    Exclusive Item {item}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Limited edition premium collectible
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-600">$99.99</span>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Purchase with Stripe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}