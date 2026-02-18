'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react'


type Faqs = {
  question: string
  answer: string
}





const FAQSection =  ({faqs}:{faqs:Faqs[]} ) => {

  if (!faqs || faqs.length === 0) {
    return null
  }


  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index: any) => {
    setOpenIndex(openIndex === index ? null : index)
  }


  return (
    <section className="py-16 md:py-24 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            প্রায়শই জিজ্ঞাসিত প্রশ্ন
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          বর্ণমালা স্কুল – বহুল জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)
          </h2>
          <p className="text-lg text-gray-700">
            আমাদের ফরাসি ভাষা কোর্স সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন এবং তাদের উত্তর
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <Card key={index} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index * 100} className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader 
                className="cursor-pointer pb-4" 
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-900 text-left">
                    {faq.question}
                  </CardTitle>
                  <div className="text-primary">
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="pt-0">
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4 mr-2" />
            আরও প্রশ্ন আছে?
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আপনার প্রশ্নের উত্তর খুঁজছেন?
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            যদি আপনার কোনো প্রশ্নের উত্তর এখানে না পান, তাহলে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার সকল প্রশ্নের উত্তর দিতে প্রস্তুত।
          </p>
          <Button asChild size="lg" className="px-8 py-3">
            <a href="#contact_section">আমাদের সাথে যোগাযোগ করুন</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FAQSection