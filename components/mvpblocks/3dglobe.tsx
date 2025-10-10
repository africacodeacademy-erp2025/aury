'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-white pt-28 pb-10 font-light text-gray-800 antialiased md:pt-20 md:pb-16"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f6f4ff 100%)',
      }}
    >
      {/* Decorative gradient lights */}
      <div
        className="absolute top-0 right-0 h-1/2 w-1/2"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(255, 255, 255, 0) 60%)',
        }}
      />
      <div
        className="absolute top-0 left-0 h-1/2 w-1/2 -scale-x-100"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(255, 255, 255, 0) 60%)',
        }}
      />

      <div className="relative z-10 container mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#7b61ff]">
            SHOP SMARTER WITH AURY
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Discover & Sell Unique Products on{' '}
            <span className="text-[#7b61ff] font-normal">Aury</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
            Aury is your next-generation marketplace where buyers and creators
            connect. Find quality products, support local sellers, and grow your
            own store — all in one simple platform.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:mb-0 sm:flex-row">
            <Link
              prefetch={false}
              href="/marketplace"
              className="relative w-full overflow-hidden rounded-full border border-[#7b61ff]/30 bg-[#7b61ff] px-8 py-4 text-white shadow-lg transition-all duration-300 hover:bg-[#6a54e0] sm:w-auto"
            >
              Start Shopping
            </Link>
            <Link
              prefetch={false}
              href="/sell"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-4 text-gray-700 transition-colors hover:border-[#7b61ff]/40 hover:text-[#7b61ff] sm:w-auto"
            >
              Become a Seller
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          <div className="relative flex h-40 w-full overflow-hidden md:h-64">
            <img
              src="https://i.postimg.cc/7h4k7vcj/storefront-hero.webp"
              alt="Marketplace Illustration"
              className="absolute top-0 left-1/2 -z-10 mx-auto -translate-x-1/2 px-4 opacity-80"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg shadow-[0_0_40px_rgba(123,97,255,0.15)]">
            <img
              src="https://i.postimg.cc/FKKY5fRB/lunexa-db.webp"
              alt="Aury Dashboard"
              width={1920}
              height={1080}
              className="h-auto w-full rounded-lg border border-gray-200"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
