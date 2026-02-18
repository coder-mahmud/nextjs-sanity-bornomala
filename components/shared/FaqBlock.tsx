'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'

type Faqs = {
  question: string
  answer: string
}

const FaqBlock = ({
  faqs,
  title,
  subtitle,
}: {
  faqs: Faqs[]
  title?: string
  subtitle?: string
}) => {
  if (!faqs || faqs.length === 0) {
    return null
  }

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          data-aos="fade-up"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            প্রায়শই জিজ্ঞাসিত প্রশ্ন
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg text-gray-700">{subtitle}</p>
          )}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <Card
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Question */}
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium text-gray-900 text-left">
                      {faq.question}
                    </CardTitle>

                    {/* Rotating Chevron */}
                    <div
                      className={`transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <ChevronDown className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>

                {/* Answer with Animation */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <CardContent className="pt-0 pb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div
          data-aos="fade-up"
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4 mr-2" />
            আরও প্রশ্ন আছে?
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আপনার প্রশ্নের উত্তর খুঁজছেন?
          </h3>

          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            যদি আপনার কোনো প্রশ্নের উত্তর এখানে না পান, তাহলে আমাদের সাথে
            যোগাযোগ করুন। আমরা আপনার সকল প্রশ্নের উত্তর দিতে প্রস্তুত।
          </p>

          <Button asChild size="lg" className="px-8 py-3">
            <a href="/contact">আমাদের সাথে যোগাযোগ করুন</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FaqBlock
