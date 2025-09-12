import React from "react";
import Link from "next/link";
import { ShoppingBag, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to <span className="text-primary-600">Aury</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Your ultimate destination for crochet patterns, handmade crafts, and
          creative inspiration. Discover unique designs and connect with
          talented creators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-medium transition-colors"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/marketplace" className="group">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover-lift">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mb-4">
              <ShoppingBag className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Marketplace
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Browse and purchase unique handmade crafts and crochet patterns
              from talented creators.
            </p>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mb-4">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Community
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Connect with fellow craft enthusiasts, share projects, and get
            inspired by the community.
          </p>
        </div>
      </section>
    </main>
  );
}
