import React from "react";
import { motion } from "framer-motion";
import PublicNavbar from "../components/PublicNavbar";
import { useToast } from "../components/Toast";

export default function FeedbackPage() {
  const { show, ToastEl } = useToast();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {ToastEl}
      <PublicNavbar transparentOnTop={false} />

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto min-h-[85vh] flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Send Us Feedback</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We'd love to hear your thoughts, suggestions, or any issues you've faced.
          </p>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            show("Thank you for your feedback!", "success");
            e.target.reset();
          }}
          className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Name</label>
              <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email</label>
              <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Message</label>
            <textarea required rows={5} placeholder="Your message here..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/30 text-lg">
            Send Feedback
          </button>
        </motion.form>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <p>© 2026 UniCompanion. All rights reserved.</p>
      </footer>
    </div>
  );
}
