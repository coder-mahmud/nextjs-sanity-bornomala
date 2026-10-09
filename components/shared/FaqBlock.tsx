"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

interface FaqBlockProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FaqBlock({ faqs, title }: FaqBlockProps) {
  // Track which FAQ index is open (null = all closed)
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        )}

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 bg-gray-50/50 hover:bg-gray-50"
              >
                {/* FAQ Question Header (Clickable) */}
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-semibold text-gray-800 text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* FAQ Answer Body (Collapsible) */}
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-gray-600 text-sm border-t border-gray-100 pt-3 bg-white">
                    <div
                      className="prose text-gray-600 text-sm max-w-none prose-p:my-1 prose-ul:my-1"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}