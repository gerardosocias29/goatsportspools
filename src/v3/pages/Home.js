import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-brand-50"></div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 border border-brand-200 text-brand-600 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              New: NBA Squares Pools Now Live!
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
              <span className="text-gray-900">The Ultimate</span>
              <br />
              <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-orange-500 bg-clip-text text-transparent">
                Sports Pools
              </span>
              <br />
              <span className="text-gray-900">Experience</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join thousands of players in NFL, NBA, and NCAA squares pools.
              <br className="hidden sm:block" />
              Create your own pools, invite friends, and compete for glory.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/sign-up"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/v3/squares"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all shadow-sm"
              >
                Browse Pools
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">10K+</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">5K+</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">Pools Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">$500K+</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">Prizes Awarded</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features to make your sports pool experience seamless and exciting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Squares Pools
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create and manage 10x10 squares grids for any NFL, NBA, or NCAA game.
                Random number assignments and automatic winner calculations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Flexible Payouts
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Customize payout percentages for each quarter. Support for entry fees,
                credits, or free pools. Automatic pot calculations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Sharing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Share your pool with friends via QR code or direct link.
                Password protection available for private pools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                All Your Favorite Sports
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether it's the Super Bowl, March Madness, or NBA Finals - we've got you covered.
                Create pools for any game, any sport, any time.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏈</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">NFL Football</div>
                    <div className="text-sm text-gray-500">Weekly games & Super Bowl</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏀</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">NBA Basketball</div>
                    <div className="text-sm text-gray-500">Regular season & Playoffs</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏀</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">NCAA Basketball</div>
                    <div className="text-sm text-gray-500">March Madness & tournaments</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Decorative squares grid */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg ${
                      [3, 7, 11, 13, 17, 21].includes(i)
                        ? 'bg-gradient-to-br from-brand-500 to-orange-500 shadow-lg shadow-brand-500/20'
                        : 'bg-gray-100 border border-gray-200'
                    } transition-all duration-300 hover:scale-105`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Pool?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Create your account in seconds and start inviting friends to your first pool.
            It's completely free to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-brand-600 bg-white hover:bg-gray-100 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
            <Link
              to="/v3/squares"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl transition-all"
            >
              View Demo Pool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
