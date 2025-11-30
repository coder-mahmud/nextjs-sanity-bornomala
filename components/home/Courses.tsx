import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Star, BookOpen } from 'lucide-react'
import Link from 'next/link'

const CoursesSection = () => {
  const courses = [
    {
      id: 1,
      title: "বিগিনার্স ফরাসি কোর্স",
      level: "A1-A2",
      duration: "৩ মাস",
      students: "১২০+",
      rating: "৪.৮",
      description: "ফরাসি ভাষার ভিত্তি শিখুন। বর্ণমালা, সাধারণ বাক্য, পরিচয় এবং দৈনন্দিন কথোপকথনের জন্য প্রয়োজনীয় শব্দভান্ডার অন্তর্ভুক্ত।",
      features: ["বর্ণমালা ও উচ্চারণ", "সাধারণ বাক্য গঠন", "দৈনন্দিন কথোপকথন", "সংস্কৃতিক পরিচিতি"]
    },
    {
      id: 2,
      title: "ইন্টারমিডিয়েট ফরাসি কোর্স",
      level: "B1-B2",
      duration: "৪ মাস",
      students: "৯৫+",
      rating: "৪.৯",
      description: "আপনার ফরাসি দক্ষতা উন্নত করুন। জটিল বাক্য গঠন, বিভিন্ন কাল এবং বিষয়ভিত্তিক শব্দভান্ডার শিখুন।",
      features: ["জটিল বাক্য গঠন", "বিভিন্ন কালের ব্যবহার", "বিষয়ভিত্তিক শব্দভান্ডার", "লেখার দক্ষতা"]
    },
    {
      id: 3,
      title: "অ্যাডভান্সড ফরাসি কোর্স",
      level: "C1-C2",
      duration: "৬ মাস",
      students: "৬৫+",
      rating: "৪.৯",
      description: "ফরাসি ভাষায় দক্ষতা অর্জন করুন। উন্নত ব্যাকরণ, সাহিত্যিক বিশ্লেষণ এবং পেশাদার যোগাযোগের কৌশল শিখুন।",
      features: ["উন্নত ব্যাকরণ", "সাহিত্যিক বিশ্লেষণ", "পেশাদার যোগাযোগ", "বিতর্ক ও উপস্থাপনা"]
    },
    {
      id: 4,
      title: "DELF পরীক্ষার প্রস্তুতি",
      level: "A1-B2",
      duration: "২-৩ মাস",
      students: "১৫০+",
      rating: "৪.৯",
      description: "DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি। পরীক্ষার ফরম্যাট, প্রশ্নের ধরণ এবং কৌশল নিয়ে বিস্তারিত অনুশীলন।",
      features: ["পরীক্ষার ফরম্যাট", "প্রশ্নের ধরণ ও কৌশল", "মক টেস্ট", "ব্যক্তিগত ফিডব্যাক"]
    },
    {
      id: 5,
      title: "ব্যবসায়িক ফরাসি",
      level: "B1-C1",
      duration: "৩ মাস",
      students: "৮০+",
      rating: "৪.৮",
      description: "ব্যবসায়িক পরিবেশে ফরাসি ব্যবহার শিখুন। ব্যবসায়িক পরিভাষা, ইমেল লেখা, মিটিং পরিচালনা এবং উপস্থাপনা করার দক্ষতা অর্জন করুন।",
      features: ["ব্যবসায়িক পরিভাষা", "ইমেল ও রিপোর্ট লেখা", "মিটিং পরিচালনা", "উপস্থাপনা কৌশল"]
    },
    {
      id: 6,
      title: "কনভারসেশন ক্লাব",
      level: "A2-C2",
      duration: "চলমান",
      students: "২০০+",
      rating: "৪.৯",
      description: "আত্মবিশ্বাসের সাথে ফরাসি কথা বলতে শিখুন। সাপ্তাহিক গ্রুপ সেশনে বিভিন্ন বিষয়ে আলোচনা করুন এবং আপনার কথোপকথনের দক্ষতা উন্নত করুন।",
      features: ["গ্রুপ আলোচনা", "বিভিন্ন বিষয়", "সংশোধন ও ফিডব্যাক", "সাপ্তাহিক সেশন"]
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            আমাদের কোর্সসমূহ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আপনার প্রয়োজন অনুযায়ী কোর্স নির্বাচন করুন
          </h2>
          <p className="text-lg text-gray-700">
            বিগিনার থেকে অ্যাডভান্সড লেভেল পর্যন্ত বিভিন্ন কোর্স যা আপনার লক্ষ্য অর্জনে সাহায্য করবে
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course,idx) => (
            <Card key={course.id} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={idx*100} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {course.title}
                  </CardTitle>
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded">
                    {course.level}
                  </span>
                </div>
                <CardDescription className="text-gray-700 text-base">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>সময়কাল: {course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    <span>শিক্ষার্থী: {course.students}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-primary" />
                    <span>রেটিং: {course.rating}/5</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">কোর্সের বৈশিষ্ট্য:</h4>
                  <ul className="space-y-1">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-primary mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <div className="px-6 pb-6 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.id}`}>
                    বিস্তারিত দেখুন
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            সকল কোর্সের জন্য বিনামূল্যে পরামর্শ
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            কোন কোর্সটি আপনার জন্য উপযুক্ত?
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            আমাদের বিশেষজ্ঞ টিউটররা আপনার প্রয়োজন অনুযায়ী সঠিক কোর্স নির্বাচনে সাহায্য করবেন।
          </p>
          <Button asChild size="lg" className="px-8 py-3">
            <Link href="/contact">
              পরামর্শের জন্য যোগাযোগ করুন
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CoursesSection