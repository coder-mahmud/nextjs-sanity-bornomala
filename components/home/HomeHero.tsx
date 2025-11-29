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
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Private French Language Coaching
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Master French with <span className="text-primary">Personalized</span> Coaching
            </h1>
            
            {/* <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              Unlock your French language potential with our tailored private coaching sessions. 
              From beginners to advanced learners, we help you achieve fluency with confidence.
            </p>             */}
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
            আমাদের তৈরি করা ব্যক্তিগত কোচিং সেশনের মাধ্যমে আপনার ফরাসি ভাষার সম্ভাবনাকে উন্মোচন করুন। শিক্ষানবিস থেকে উন্নত শিক্ষার্থী পর্যন্ত, আমরা আপনাকে আত্মবিশ্বাসের সাথে ভাষায় দক্ষতা অর্জন করতে সাহায্য করি।
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="text-lg px-6 py-3 rounded">
                <Link href="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-6 py-3 rounded">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">2600+ Students</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">95% Success rate</span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-700">Expert Tutors</span>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                <Image 
                  src="/images/french-learning.jpg" 
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