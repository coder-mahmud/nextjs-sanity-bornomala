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


  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index: any) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  /*
  const faqs = [
    {
      question: "কোর্সের মেয়াদ কতদিন?",
      answer: "DELF A1: ৩ মাস ১ সপ্তাহ, DELF A2: ৪ মাস ১ সপ্তাহ, DELF B1: ৪ মাস + ২ সপ্তাহ এবং DELF B2 : ৫মাস ।"
    },
    {
      question: "কোর্সের বিস্তারিত জানাবেন?",
      answer: "DELF A-1: মোট ১৩টি ক্লাস, প্রতি সপ্তাহে ১টি ক্লাস, প্রতিটি ক্লাসের সময় ৩ ঘণ্টা। DELF A-2: মোট ১৭টি ক্লাস, প্রতি সপ্তাহে ১টি ক্লাস, প্রতিটি ক্লাসের সময় ৩ ঘণ্টা। DELF B1: মোট ১৮টি ক্লাস, প্রতি সপ্তাহে ১টি ক্লাস, প্রতিটি ক্লাসের সময় ৩ ঘণ্টা। DELF B2 : মোট ২০টি ক্লাস, প্রতি ক্লাসে ৩ঘন্টা করে ।"
    },
    {
      question: "কিস্তিতে ফি প্রদান করা যাবে কি?",
      answer: "জ্বি না, কিস্তিতে ফি প্রদানের সুযোগ নেই। তবে ভর্তি হওয়ার সময় ৫০% ফি পরিশোধ করা যেতে পারে , তবে বাকি অর্থ কোর্স শুরু হওয়ার আগে সম্পূর্ণ পরিশোধ করতে হবে।"
    },
    {
      question: "অনলাইন ক্লাসের কোনো ব্যবস্থা আছে কি?",
      answer: "জ্বি না, বর্তমানে আমরা কোনো অনলাইন ক্লাস আয়োজনের চিন্তা করছিনা।"
    },
    {
      question: "আপনারা কি ফরাসি শেখার বই বা উপকরণ বিক্রি করেন?",
      answer: "জ্বি না, আমরা কোনো বই বা শিক্ষাসামগ্রী বাহিরে শিক্ষার্থীদের বিক্রি করিনা। আমাদের একল বর্ণমালার শিক্ষার্থীদের জন্য প্রয়োজনীয় সব লেকচার শীট ও শিক্ষাসামগ্রী একান্তভাবে কোর্সে ফ্রিতে সরবরাহ করা হয়।"
    },
    {
      question: "ভর্তি হওয়ার পর কি আমি আগে থেকেই লেকচার শীট বা শিক্ষাসামগ্রী পেতে পারি?",
      answer: "দুঃখিত, আমাদের নির্ধারিত ক্লাস সূচি অনুযায়ীই প্রতি ক্লাসের লেকচার শীট ও শিক্ষাসামগ্রী প্রদান করা হয়।"
    },
    {
      question: "আমি নিয়মিতকরণ, কার্ড নবায়ন, ফরাসি নাগরিকত্ব আবেদন বা শরণার্থী সংক্রান্ত বিষয়ে পরামর্শ চাই। আপনারা কি সহায়তা করেন?",
      answer: "বর্ণমালা স্কুল শুধুমাত্র ফরাসি ভাষা শিক্ষার কোর্স এবং অফিসিয়াল DELF পরীক্ষা পরিচালনা করে। আমরা কোনো সামাজিক, প্রশাসনিক বা আইনি সেবা প্রদান করি না।"
    },
    {
      question: "আমি কি বর্ণমালা স্কুল থেকেই DELF পরীক্ষায় অংশগ্রহণ করতে পারি?",
      answer: "হ্যাঁ, আমাদের বর্ণমালা হোশ শাখা ( École Bornomala HOCHE Branch) হচ্ছে পরীক্ষাকেন্দ্র। শিক্ষার্থীরা সরাসরি আমাদের স্কুল থেকেই DELF পরীক্ষার জন্য নিবন্ধন করতে পারবেন।"
    },
    {
      question: "DELF পরীক্ষার বিস্তারিত জানতে চাই !",
      answer: "আমরা আমাদের শিক্ষার্থীদের পক্ষ থেকে পরীক্ষার ফর্ম পূরণ করি। এবং ফ্রিতে একের অধিক মক টেস্ট নিয়ে থাকি । আর মার্কশিট (Attestation de réussite) ? স্পিকিং অংশে অংশগ্রহণের পড়, সাধারণত শিক্ষার্থীরা মৌখিক পরীক্ষার ৬ সপ্তাহের পর আমাদের প্যারিস শাখা থেকে মার্কশিট  সংগ্রহ করতে পারবেন, যা আপনি আপনার প্রশাসনিক যেকোন প্রয়োজনে ব্যবহার করতে পারবেন। পরবর্তীতে, পরীক্ষার তারিখ থেকে, ৬মাসের মধ্যে DELF সনদটি আমাদের  অফিসে পাবেন। চিন্তা করবেন না, ফলাফল এবং ডিপ্লোমা সংগ্রহের দিন এবং সময় আমাদের অফিসিয়াল ওয়েব সাইটে পাব্লিশ করা হবে।"
    }
  ]
*/


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