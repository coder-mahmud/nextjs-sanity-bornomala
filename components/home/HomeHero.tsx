// 'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Users, Award, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'


const HomeHero = () => {
  return (
    <section className="relative bg-linear-to-br from-blue-50 to-indigo-100 py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="grid grid-cols-8 grid-rows-6 w-full h-full">
            {[...Array(48)].map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>
      </div> */}


      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div  className="flex flex-col lg:flex-row items-center gap-5">
          {/* Left Content */}

          <div  className="lg:w-1/2 lg:pr-10  lg:mb-0 order-2 lg:order-1">
            
            <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Private French Language Coaching
            </div>
            
            <h1 data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100"  className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-tight">
            আপনার ফরাসি শেখার যাত্রা শুরু হোক,- একটি বিশ্বস্ত ও পেশাদার ভাষা স্কুলের সাথে।
            </h1>
            
            {/* <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              Unlock your French language potential with our tailored private coaching sessions. 
              From beginners to advanced learners, we help you achieve fluency with confidence.
            </p>             */}
            <p data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="200" className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
            ভাষা শিক্ষার সব সুবিধা এক ছাদের নিচে  - École Bornomala হলো আপনার ফরাসি ভাষা শেখার সম্পূর্ণ সমাধান। এখানে প্রফেসনাল শিক্ষকদের দিকনির্দেশনায়, আপনি পৌঁছাবেন  DELF A1 থেকে  DELF B2 পর্যন্ত, ঠিক ২ বছরের মধ্যে, সম্পূর্ণ  আত্মবিশ্বাসের সাথে। প্রতিটি লেভেল শেষে পরীক্ষায় সফলতা এবং  ফরাসিতে সাবলীলভাবে কথা বলতে পারা—দুটোরই নিশ্চয়তা পাচ্ছেন আমাদের প্রতিষ্ঠানে ।
            </p>
            
            <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="300" className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="text-lg px-6 py-3 rounded">
                <Link href="/success-stories">
                সফলতার গল্প  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-6 py-3 rounded">
                <Link href="/courses">
                আমাদের কোর্সসমূহ
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <div data-aos="fade-left" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">৩০০০ + শিক্ষার্থী</span>
              </div>
              <div data-aos="fade-left" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="100" className="flex items-center">
                <GraduationCap className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">৯৮ % সাফল্যের হার</span>
              </div>
              <div data-aos="fade-left" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="200" className="flex items-center">
                <Award className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">৪০০+ DELF সনদপ্রাপ্ত </span>
              </div>
            </div>
          </div>

          
          {/* Right Image */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="lg:w-1/2 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                <Image 
                  src="/images/hero-img.webp" 
                  alt="French language learning" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </section>
  )
}

export default HomeHero