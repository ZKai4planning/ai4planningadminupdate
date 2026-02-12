"use client";

import { FormEvent, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { mockFeedbackQueue } from "@/app/lib/mock-data";

type FeedbackItem = (typeof mockFeedbackQueue)[number];

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockFeedbackQueue);
  const [source, setSource] = useState("Superadmin Dashboard");
  const [category, setCategory] = useState("feature");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const newEntry: FeedbackItem = {
      id: `fb${String(feedbackItems.length + 1).padStart(3, "0")}`,
      source,
      category: category as FeedbackItem["category"],
      priority: priority as FeedbackItem["priority"],
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      submittedBy: "Superadmin",
    };

    setFeedbackItems((prev) => [newEntry, ...prev]);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-600 mt-2">
          Capture platform feedback and triage items before assigning to teams.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900">Add Feedback</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Source module"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="feature">feature</option>
            <option value="bug">bug</option>
            <option value="ux">ux</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Write the issue, impact, and expected behavior..."
        />

        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Submit feedback
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Feedback Queue</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {feedbackItems.map((item) => (
            <div key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 font-semibold">
                  {item.category}
                </span>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 font-semibold">
                  {item.priority}
                </span>
                <span className="text-slate-500">{item.source}</span>
              </div>
              <p className="text-sm text-slate-900">{item.message}</p>
              <p className="text-xs text-slate-500 mt-2">
                {item.submittedBy} | {new Date(item.submittedAt).toLocaleString("en-GB")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
