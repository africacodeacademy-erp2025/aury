import React from 'react';
import MarketplaceGrid from '@/components/marketplace/MarketplaceGrid';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';

export default function MarketplacePage() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Craft Marketplace
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Discover unique handmade crafts and crochet patterns from talented creators
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <MarketplaceFilters />
        </aside>
        
        <div className="flex-1">
          <MarketplaceGrid />
        </div>
      </div>
    </main>
  )
}