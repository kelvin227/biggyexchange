"use client";

import { useState } from "react";
import {
  ShieldAlert,
  CircleHelp,
  BadgeCheck,
  CreditCard,
  UserRound,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const supportCategories = [
  {
    title: "Account Issues",
    description: "Help with login, account access, or profile-related concerns.",
    icon: UserRound,
  },
  {
    title: "Buy / Sell Problems",
    description: "Support for transaction flow, order delays, or failed requests.",
    icon: CreditCard,
  },
  {
    title: "Verification / KYC",
    description: "Questions about identity verification and account approval.",
    icon: BadgeCheck,
  },
  {
    title: "Security Concerns",
    description: "Report suspicious activity or get help securing your account.",
    icon: ShieldAlert,
  },
];

const faqs = [
  {
    question: "How long does verification take?",
    answer:
      "Verification times can vary, but most reviews are completed within business hours after all required details are submitted.",
  },
  {
    question: "Why is my transaction still pending?",
    answer:
      "Pending transactions may be awaiting payment confirmation, blockchain confirmation, or manual review.",
  },
  {
    question: "What should I include in my support request?",
    answer:
      "Include your registered email, transaction reference, issue summary, and any helpful screenshots.",
  },
  {
    question: "How do I report suspicious activity?",
    answer:
      "Select Security Concerns and describe the issue in as much detail as possible.",
  },
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState("Account Issues");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reference: "",
    subject: "Account Issues",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = (title: string) => {
    setSelectedCategory(title);
    setFormData((prev) => ({
      ...prev,
      subject: title,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);

    try {
      console.log("Support form submitted:", formData);

      // Replace this with your actual API call
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit support request");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        reference: "",
        subject: selectedCategory,
        message: "",
      });
    } catch (error) {
      console.error("Support request error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
            <CircleHelp className="mr-2 h-4 w-4" />
            Biggy Exchange Support
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            How can we help?
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg dark:text-gray-300">
            Choose a support category below and tell us what went wrong. This
            helps us direct your issue faster.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {supportCategories.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedCategory === item.title;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleCategorySelect(item.title)}
                className={`rounded-3xl border p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                  isSelected
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-neutral-950 dark:text-white"
                }`}
              >
                <div
                  className={`mb-4 inline-flex rounded-2xl p-3 shadow-sm ${
                    isSelected
                      ? "bg-white/10 dark:bg-black/10"
                      : "light::bg-gray-50 dark:bg-neutral-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    isSelected
                      ? "text-white/80 dark:text-black/70"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-neutral-950">
            <h3 className="text-2xl font-semibold">Contact Support</h3>
            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
              Selected category:{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedCategory}
              </span>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Transaction Reference
                  <span className="ml-1 text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="e.g. BGX-123456"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Issue Type</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  readOnly
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-neutral-900 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Describe Your Problem</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us exactly what happened..."
                  required
                  rows={6}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {loading ? "Submitting..." : "Submit Request"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>

              {submitted && (
                <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Your support request has been submitted successfully.
                </div>
              )}
            </form>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-900">
                <ShieldAlert className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Security Notice
                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
                  Biggy Exchange support will never ask for your password, OTP,
                  recovery phrase, or private wallet keys.
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-300">
                  If anyone asks for sensitive information while claiming to be
                  support, please report it immediately through this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-gray-200 light::bg-gray-50 p-8 md:p-10 dark:border-gray-800 dark:bg-neutral-950">
          <h3 className="text-2xl font-semibold">Frequently Asked Questions</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-white p-6 shadow-sm dark:bg-black"
              >
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </h4>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}