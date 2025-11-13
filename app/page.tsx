"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import {
  ShoppingBag,
  Palette,
  TrendingUp,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const page = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Curated Marketplace",
      description:
        "Discover unique, handcrafted products from talented creators worldwide.",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Palette,
      title: "Creative Community",
      description:
        "Connect with artisans, share your work, and get inspired daily.",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description:
        "Powerful tools to help creators sell, track earnings, and scale effortlessly.",
      color: "bg-primary-500/10 text-primary-500",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Stripe-powered checkout ensures safe transactions for buyers and sellers.",
      color: "bg-green-500/10 text-green-500",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "5K+", label: "Products Listed" },
    { value: "99%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-primary-100/5 to-white dark:from-dark-100 dark:via-dark-200/50 dark:to-dark-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-600 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Welcome to the Future of Handmade Commerce
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Discover Unique Crafts
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 bg-clip-text text-transparent">
                Support Real Creators
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Aury is your destination for handcrafted treasures and creative
              patterns. Shop from talented artisans or start selling your own
              creations with powerful tools built for makers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/marketplace" onClick={() => posthog.capture('test_event')}>
                <Button className="bg-primary-200 text-white text-base px-8 py-6 shadow-md shadow-primary-200/50 rounded-full transition-all">
                  Explore Marketplace
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="btn-secondary text-white text-base px-8 py-6">
                  Start Selling Today
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Secure Payments
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Verified Sellers
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Quality Guaranteed
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="aspect-video bg-gradient-to-br from-primary-100 via-purple-100 to-blue-100 dark:from-primary-600/20 dark:via-purple-600/20 dark:to-blue-600/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="flex justify-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white dark:bg-dark-200 shadow-lg flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-primary-600" />
                    </div>
                    <div className="w-20 h-20 rounded-xl bg-white dark:bg-dark-200 shadow-lg flex items-center justify-center">
                      <Palette className="w-10 h-10 text-purple-600" />
                    </div>
                    <div className="w-20 h-20 rounded-xl bg-white dark:bg-dark-200 shadow-lg flex items-center justify-center">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    Your Creative Marketplace Awaits
                  </h3>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-dark-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Why Choose Aury?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 dark:text-gray-300"
              >
                Everything you need to buy, sell, and thrive in the handmade
                economy
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group p-8 rounded-2xl bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 p-12 md:p-16 text-center"
          >
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Ready to Join Aury?
              </h2>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Whether you&apos;re here to shop or sell, your creative journey
                starts now
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/sign-up">
                  <Button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-6 text-base font-semibold rounded-full shadow-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-full">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default page;
