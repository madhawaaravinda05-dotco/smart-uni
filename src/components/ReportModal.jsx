import React, { useState } from "react";
import { XIcon } from "./Icons";
import { Button, Input } from "./ui";

const REASONS = [
  "Scam or fraud",
  "False or misleading information",
  "Inappropriate content",
  "Spam",
  "Other"
];

export default function ReportModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit({ reason: selectedReason, message });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-fadeIn" onClick={onClose} />
      
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-border animate-slideDown flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <h3 className="text-lg font-black text-foreground">Report Listing</h3>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-200/50 dark:bg-slate-800 rounded-full transition-colors">
              <XIcon size={16} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
              Why are you reporting this post?
            </p>
            
            <div className="flex flex-col gap-3 mb-6">
              {REASONS.map((r) => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReason === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border hover:border-slate-300 dark:hover:border-slate-600'}`}>
                  <input
                    type="radio"
                    name="report_reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 focus:ring-primary-500"
                  />
                  <span className={`text-sm font-semibold ${selectedReason === r ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {r}
                  </span>
                </label>
              ))}
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Additional Details (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide more context to help admins review..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none h-24"
              />
            </div>
          </div>
          
          <div className="p-5 border-t border-border flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!selectedReason || isSubmitting} loading={isSubmitting}>
              Submit Report
            </Button>
          </div>
          
        </div>
      </div>
    </>
  );
}
