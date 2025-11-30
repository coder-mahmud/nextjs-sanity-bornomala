import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Users, Award, Clock, Globe, Target } from 'lucide-react'
import Link from 'next/link'

const WhyChooseUsSection = () => {
  const advantages = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "ব্যক্তিগতকৃত শিক্ষাণ পদ্ধতি",
      description: "প্রতিটি শিক্ষার্থীর শেখার ধরণ, গতি এবং লক্ষ্য অনুযায়ী কাস্টমাইজড পাঠ্যক্রম তৈরি করা হয়।"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "অভিজ্ঞ নেটিভ টিউটর",
      description: "ফরাসি ভাষার নেটিভ স্পিকার দ্বারা প্রশিক্ষিত টিউটর যারা সাংস্কৃতিক বোঝাপড়া সহ সঠিক উচ্চারণ শেখান।"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "নমনীয় সময়সূচী",
      description: "আপনার সুবিধামতো সময় নির্বাচন করুন। সপ্তাহের সাত দিনই ক্লাসের সুবিধা রয়েছে।"
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "পরীক্ষার প্রস্তুতি",
      description: "DELF, DALF, TCF এবং TEF এর মতো আন্তর্জাতিক ফরাসি ভাষা পরীক্ষার জন্য বিশেষ প্রস্তুতি।"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "বাস্তব জীবনের প্রয়োগ",
      description: "শুধু ব্যাকরণ নয়, বাস্তব জীবনের কথোপকথন, ভ্রমণ এবং ব্যবসায়িক পরিস্থিতিতে ফরাসি প্রয়োগ করতে শিখুন।"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "দ্রুত ফলাফল",
      description: "আমাদের কার্যকর শিক্ষণ পদ্ধতির মাধ্যমে স্বল্প সময়ের মধ্যেই লক্ষণীয় অগ্রগতি অর্জন করুন।"
    }
  ]

  const stats = [
    { value: "৯৫%", label: "সাফল্যের হার" },
    { value: "৫০০+", label: "সন্তুষ্ট শিক্ষার্থী" },
    { value: "১০+", label: "অভিজ্ঞ টিউটর" },
    { value: "৪.৯/৫", label: "গড় রেটিং" }
  ]

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4 mr-2" />
            কেন আমাদের বেছে নেবেন
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আপনার ফরাসি শেখার সেরা সঙ্গী
          </h2>
          <p className="text-lg text-gray-700">
            আমাদের ব্যতিক্রমী পদ্ধতি এবং অভিজ্ঞতা আপনাকে ফরাসি ভাষায় দক্ষতা অর্জনে সাহায্য করবে
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index*100} className="border-0 shadow-lg text-center py-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <Card key={index} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index*100} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6">
                <div className="mb-4">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {advantage.title}
                </h3>
                <p className="text-gray-700">
                  {advantage.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                আজই আপনার ফরাসি শেখার যাত্রা শুরু করুন
              </h3>
              <p className="text-gray-700 mb-6">
                আমাদের বিশেষজ্ঞ টিউটরদের সাথে একটি বিনামূল্যে পরামর্শ সেশন বুক করুন এবং দেখুন আমরা কিভাবে আপনাকে সাহায্য করতে পারি।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-6 py-3">
                  <Link href="/contact">
                    বিনামূল্যে পরামর্শ বুক করুন
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-6 py-3">
                  <Link href="/courses">
                    কোর্স দেখুন
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="relative bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">২০%</div>
                    <div className="text-gray-700 font-medium">ছাড়</div>
                    <div className="text-sm text-gray-600 mt-2">প্রথম কোর্সের উপর</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Separator */}
      {/* <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-12 md:h-16 lg:h-20">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,90.7C960,96,1056,96,1152,90.7C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div> */}
      
      {/* <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style> */}
    </section>
  )
}

export default WhyChooseUsSection