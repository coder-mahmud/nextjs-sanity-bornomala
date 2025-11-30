import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Clock, Award, Globe, Target } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "ব্যক্তিগতকৃত শিক্ষাক্রম",
      description: "প্রতিটি শিক্ষার্থীর প্রয়োজন অনুযায়ী তৈরি করা কাস্টমাইজড লার্নিং প্ল্যান যা আপনার শেখার গতি এবং লক্ষ্য অনুসরণ করে।",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "বিশেষজ্ঞ নেটিভ টিউটর",
      description: "ফরাসি ভাষার দক্ষ নেটিভ স্পিকার দ্বারা প্রশিক্ষিত যারা আপনাকে সঠিক উচ্চারণ এবং সাংস্কৃতিক বোঝাপড়া শেখাবেন।",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "নমনীয় সময়সূচী",
      description: "আপনার ব্যস্ত জীবনধারা অনুযায়ী সময় নির্বাচন করুন। আমরা সপ্তাহের সাত দিনই ক্লাসের সুবিধা দিয়ে থাকি।",
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "পরীক্ষার প্রস্তুতি",
      description: "DELF, DALF, TCF এবং TEF এর মতো আন্তর্জাতিক ফরাসি ভাষা পরীক্ষার জন্য বিশেষ প্রস্তুতি এবং অনুশীলন।",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "বাস্তব জীবনের প্রয়োগ",
      description: "শুধু ব্যাকরণ নয়, বাস্তব জীবনের কথোপকথন, ভ্রমণ এবং ব্যবসায়িক পরিস্থিতিতে ফরাসি প্রয়োগ করতে শিখুন।",
    },
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "দ্রুত ফলাফল",
      description: "আমাদের কার্যকর শিক্ষণ পদ্ধতির মাধ্যমে স্বল্প সময়ের মধ্যেই লক্ষণীয় অগ্রগতি অর্জন করুন এবং আত্মবিশ্বাসের সাথে ফরাসি বলুন।",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 data-aos="fade-up" data-aos-offset="0" data-aos-duration="800" data-aos-delay="0" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            কেন আমাদের বেছে নেবেন?
          </h2>
          <p data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" className="text-lg text-gray-700">
            আমাদের ব্যক্তিগত ফরাসি ভাষা কোচিং আপনাকে আপনার লক্ষ্য অর্জনে সাহায্য করবে
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index * 100} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardHeader className="pb-4">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-700 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4 mr-2" />
            ৯৫% শিক্ষার্থী তাদের লক্ষ্য অর্জন করেছে
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আজই আপনার ফরাসি শেখার যাত্রা শুরু করুন
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            আমাদের বিশেষজ্ঞ টিউটরদের সাথে একটি বিনামূল্যে পরামর্শ সেশন বুক করুন এবং দেখুন আমরা কিভাবে আপনাকে সাহায্য করতে পারি।
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <a href="#contact_section">

            বিনামূল্যে পরামর্শ বুক করুন
          </a>
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection