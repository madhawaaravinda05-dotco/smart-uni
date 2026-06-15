import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicNavbar from "../components/PublicNavbar";
import { CheckIcon, ZapIcon, HomeIcon, CoffeeIcon } from "../components/Icons";

export default function PricingPage() {
  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      <PublicNavbar transparentOnTop={false} />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-block py-1 px-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
              Simple, Transparent Pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Choose Your Path to <span className="text-primary-600 dark:text-primary-400">Campus Success</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Join hundreds of property owners and food vendors connecting directly with university students. No hidden fees.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col"
          >
            <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <HomeIcon size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black">Free</span>
              <span className="text-slate-500 font-medium">forever</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-8 flex-1">
              Perfect for small business owners or landlords just getting started. 
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckIcon className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="font-medium">Your first 2 posts are completely FREE!</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-slate-600 dark:text-slate-300">Valid for Boardings or Food Shops</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-slate-600 dark:text-slate-300">Basic analytics & views</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-green-500 shrink-0 mt-0.5" size={18} />
                <span className="text-slate-600 dark:text-slate-300">Standard support</span>
              </li>
            </ul>
            <Link to="/register" className="w-full py-4 rounded-xl font-bold text-center border-2 border-slate-200 dark:border-slate-700 hover:border-primary-600 dark:hover:border-primary-500 hover:text-primary-600 transition-colors">
              Get Started for Free
            </Link>
          </motion.div>

          {/* Premium Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary-900 to-indigo-900 rounded-3xl p-8 border border-primary-800 shadow-2xl text-white flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-primary-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
            </div>
            <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-primary-300 backdrop-blur-sm">
              <ZapIcon size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium Scale</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black">Rs. 990</span>
              <span className="text-primary-200 font-medium">/ per post</span>
            </div>
            <p className="text-primary-200 mb-8 flex-1">
              For established vendors who want to list multiple properties or shops across campuses.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckIcon className="text-primary-400 shrink-0 mt-0.5" size={18} />
                <span className="font-medium text-white">Create unlimited posts</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-primary-400 shrink-0 mt-0.5" size={18} />
                <span className="text-primary-100">Featured priority listing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-primary-400 shrink-0 mt-0.5" size={18} />
                <span className="text-primary-100">Advanced performance insights</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-primary-400 shrink-0 mt-0.5" size={18} />
                <span className="text-primary-100">Priority 24/7 support</span>
              </li>
            </ul>
            <Link to="/register" className="w-full py-4 rounded-xl font-bold text-center bg-white text-primary-900 hover:bg-slate-100 transition-colors shadow-lg">
              Start Scaling Now
            </Link>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is the student account free?", a: "Yes! Students get 100% free access to browse all resources, review places, and use the smart maps. Pricing only applies to vendors/landlords posting listings." },
              { q: "What happens after my 2 free posts?", a: "Your first two active posts (either boarding or food shop) are completely free. If you wish to list a 3rd item, you will be prompted to upgrade to a premium post." },
              { q: "Are there any subscription fees?", a: "No. You only pay a one-time fee per active premium post. We do not charge monthly subscription fees." },
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <p>© 2026 UniCompanion. All rights reserved.</p>
      </footer>
    </div>
  );
}
