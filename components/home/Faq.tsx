'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react'

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "আমি ফরাসি ভাষায় একদম নতুন। আমি কি শুরু করতে পারব?",
      answer: "হ্যাঁ, অবশ্যই! আমাদের বিগিনার্স কোর্স সম্পূর্ণ নতুনদের জন্য ডিজাইন করা হয়েছে। আমরা বর্ণমালা, সাধারণ বাক্য এবং দৈনন্দিন কথোপকথন থেকে শুরু করি। আমাদের অভিজ্ঞ টিউটররা আপনাকে ধীরে ধীরে শিখতে সাহায্য করবেন।"
    },
    {
      question: "ক্লাসের সময়সূচী কেমন হয়?",
      answer: "আমরা নমনীয় সময়সূচী অফার করি। সপ্তাহের সাত দিনই ক্লাসের সুবিধা রয়েছে। আপনি সকাল, দুপুর বা সন্ধ্যায় আপনার সুবিধামতো সময় নির্বাচন করতে পারেন। আমরা সাধারণত সপ্তাহে ২-৩ দিন ক্লাস করি, কিন্তু আপনি আপনার প্রয়োজন অনুযায়ী সময় বাড়াতে বা কমাতে পারেন।"
    },
    {
      question: "কোর্সের ফি কত?",
      answer: "কোর্সের ফি কোর্সের ধরন এবং সময়কালের উপর নির্ভর করে। বিগিনার্স কোর্সের ফি সাধারণত মাসে ৩০০০-৫০০০ টাকা, এবং অ্যাডভান্সড কোর্সের ফি মাসে ৫০০০-৮০০০ টাকা। আমরা বিভিন্ন পেমেন্ট প্ল্যান অফার করি, যার মধ্যে মাসিক, ত্রৈমাসিক এবং সেমিস্টার পেমেন্ট অপশন রয়েছে। বিস্তারিত তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।"
    },
    {
      question: "আমি কি অনলাইনে ক্লাস করতে পারব?",
      answer: "হ্যাঁ, আমরা অনলাইন ক্লাসের সুবিধা দিই। আপনি যদি বাসা থেকে বা যেকোনো স্থান থেকে ক্লাস করতে চান, আমরা জুম, গুগল মিট বা স্কাইপের মাধ্যমে অনলাইন ক্লাসের ব্যবস্থা করি। অনলাইন ক্লাসের ফি এবং সুবিধা অফলাইন ক্লাসের মতোই।"
    },
    {
      question: "ক্লাসের আকার কেমন হয়?",
      answer: "আমরা ছোট আকারের ক্লাস পছন্দ করি যাতে প্রতিটি শিক্ষার্থী ব্যক্তিগত মনোযোগ পায়। সাধারণত আমাদের ক্লাসে ৫-৮ জন শিক্ষার্থী থাকে। ব্যক্তিগত কোচিংয়ের ক্ষেত্রে, এটি এক-এক ক্লাস হয়।"
    },
    {
      question: "আমি কি DELF বা TEF পরীক্ষার জন্য প্রস্তুতি নিতে পারব?",
      answer: "হ্যাঁ, আমরা DELF, DALF, TCF এবং TEF এর মতো আন্তর্জাতিক ফরাসি ভাষা পরীক্ষার জন্য বিশেষ প্রস্তুতি কোর্স অফার করি। আমাদের অভিজ্ঞ টিউটররা পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন করান। আমাদের অনেক শিক্ষার্থী এই পরীক্ষাগুলোতে ভালো ফলাফল অর্জন করেছে।"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            প্রায়শই জিজ্ঞাসিত প্রশ্ন
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আপনার প্রশ্নের উত্তর
          </h2>
          <p className="text-lg text-gray-700">
            আমাদের ফরাসি ভাষা কোর্স সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন এবং তাদের উত্তর
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <Card key={index} className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
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

        <div className="mt-16 text-center">
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