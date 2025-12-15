import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Clock, Award, Globe, Target } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "বিশেষায়িত পাঠ্যসূচি",
      description: "ফরাসি ভাষার আয়ত্তের জন্যে আমাদের আছে নিজস্ব পাঠ্যপুস্তক এবং নিজস্ব সিলেবাস : যেটি একজন শিক্ষার্থীকে   DELF A1 থেকে সাবলীলভাবে , আনন্দের সাথে DELF B2- তে পৌঁছাতে সাহায্য করবে । প্রতিটি লেভেলেই রয়েছে ধাপে ধাপে শেখার পরিকল্পনা, কথোপকথন, লেখা, শ্রবণ এবং ব্যাকরণ—all-in-one কনটেন্ট।",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "প্রফেসনাল ফরাসি ভাষা শিক্ষক",
      description: "আমাদের শিক্ষকেরা ফরাসি এবং বাংলা—দুই ভাষাতেই দক্ষ। তারা শুধুই ভাষা শেখান না, আপনাকে স্বাভাবিক, সাবলীল এবং আত্মবিশ্বাসীভাবে ফরাসি বলতে সাহায্য করেন। প্রতিটি ক্লাসে বাস্তব কথোপকথন, সঠিক নেটিভ উচ্চারণ এবং ভাষা শিক্ষায় সাহস জুগিয়ে থাকে।",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "কথা বলায় সৃজনশীলতা এবং জড়তা মুক্তি",
      description: `• DELF A1: কথা বলার বেসিক বাক্য গঠন শেখানো শুরু হয়, যা ফরাসি কথোপকথনের জন্য মজবুত ভিত্তি গড়ে দেয়।
      • DELF A2: শিক্ষার্থীদের ক্লাসে কথা বলার জন্য উত্সাহিত করা হয় এবং মৌলিক কথোপকথন পদ্ধতি শেখানো হয়।
      • DELF B1: সৃজনশীলতা এবং সাবলীলভাবে যুক্তি উপস্থাপন করে কথোপকথন করার উপায় উন্নত করা হয়।
      • DELF B2: নেটিভ স্পিকারদের মতো এক্সপ্রেশন, যুক্তি উপস্থাপন এবং যেকোন প্রশ্নের তৎক্ষণাৎ উত্তর দেয়ার টেকনিক শেখানো হয়।`

    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "ব্যাকরণ এবং লিখায় আত্মবিশ্বাস বৃদ্ধি",
      description: "কোর্সে লেখা অনুশীলনের সময় বানান ও ব্যাকরণের দিকে বিশেষ নজর দেওয়া হয়, যাতে আপনি আত্মবিশ্বাসের সঙ্গে DELF পরীক্ষায় সঠিক চিঠি লিখতে পারেন।",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "বাস্তব জীবনের প্রয়োগ",
      description: "কোর্সে দৈনন্দিন জীবনের সঙ্গে মিল রেখে পর্যাপ্ত অডিও, ভিডিও এবং ক্লাসশীট প্রদান করা হয়। তাছাড়া, শিক্ষার্থীরা বাক্য, শব্দ, ডায়ালগ এবং বিভিন্ন সাম্প্রতিক বিষয়গুলোর উপর  কাজ করে, যা বাস্তব জীবনে ফরাসি ভাষা সহজে বোঝার এবং সেই পরিস্থিতিতে সঠিকভাবে উত্তর দেওয়ার ক্ষমতা অর্জিন করে। এর ফলে শিক্ষার্থীরা কথোপকথন, লিখন, পরে বুঝা এবং শুনতে পারার দক্ষতা সবকিছু একসাথে আয়ত্ব করতে পারে।",
    },
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "পরীক্ষা প্রস্তুতি এবং দ্রুত ফলাফল ",
      description: "একাধিক মক টেস্ট নেওয়া হয়, যা পরীক্ষার আগে শিক্ষার্থীর পরীক্ষার ভীতি দূর করে, সাহস বাড়ায় এবং ভুল চিহ্নিত করতে সাহায্য করে। য়ামাদের লক্ষ, যেনো শিক্ষার্থীরা কোর্স শেষের সাথে সাথেই যেন পরীক্ষায় উপস্তিত হতে পারে। আমরা পরীক্ষার ফলাফল শিট থেকে শুরু করে ভুল সংশোধন এবং ডিপ্লোমা গ্রহণ পর্যন্ত শিক্ষার্থীদের সাথে নিয়মিত যোগাযোগ রক্ষা করি।",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 data-aos="fade-up" data-aos-offset="0" data-aos-duration="800" data-aos-delay="0" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          কেন École Bornomala ?
          </h2>
          <p data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" className="text-lg text-gray-700">
          DELF A1 থেকে B2 পর্যন্ত সম্পূর্ণ ভাষাশিক্ষা, পরীক্ষার প্রস্তুতি এবং অংশগ্রহণ এক ছাদের নিচে।
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
                <CardDescription className="text-gray-700 text-base whitespace-pre-line">
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