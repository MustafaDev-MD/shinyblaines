import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-green-900 dark:text-white mb-3">
              Shiny Blaines Premium
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Unlock unlimited daily trades and keep your Pokédex and trade history synced across
              all your devices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e2e8e0] dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-green-900 dark:text-white mb-4">
                  Free vs Premium
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Free
                    </h3>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Browse the full Pokémon catalog</li>
                      <li>• Customize builds and validate legality</li>
                      <li>• Up to 3 trades per day</li>
                      <li>• Local Pokédex tracking on a single device</li>
                    </ul>
                  </div>
                  <div className="border border-yellow-300 dark:border-yellow-500 rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/10">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Premium
                    </h3>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                      <li>• Unlimited daily trades</li>
                      <li>• Cloud-synced Pokédex and trade history</li>
                      <li>• Priority support via Discord</li>
                      <li>• Access from any device with your account</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-3">How to Become Premium</h2>
                <p className="mb-4 text-white/90">
                  Premium access is handled through our existing community memberships. Choose your
                  preferred option below, and make sure you use the same account you connect to our
                  Discord server.
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• Discord shop or server subscriptions</li>
                  <li>• Third‑party integrations such as Mee6</li>
                  <li>• YouTube channel memberships</li>
                </ul>
                <p className="text-xs text-white/80">
                  Note: The exact provider can be configured per your preference; the website will
                  simply link to the chosen premium purchase page.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e2e8e0] dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-green-900 dark:text-white mb-3">
                  Upgrade Now
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This button will lead users to your chosen premium checkout (Discord shop, Mee6,
                  YouTube membership, or Stripe).
                </p>
                <a
                  href="https://discord.gg/blaines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg text-sm font-bold hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  ⭐ Go to Premium Checkout
                </a>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e2e8e0] dark:border-gray-700 p-6 text-sm">
                <h3 className="font-semibold text-green-900 dark:text-white mb-2">
                  Already Premium?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply sign in with the same Google account you use on Discord or YouTube. Your
                  premium status can then be linked to your website account.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

