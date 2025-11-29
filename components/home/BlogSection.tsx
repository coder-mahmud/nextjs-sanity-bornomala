import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "ফরাসি শেখার ৫টি কার্যকরী টিপস",
      excerpt: "ফরাসি ভাষা শেখার সময় কিছু কৌশল অবলম্বন করলে আপনি দ্রুত অগ্রগতি করতে পারেন। এই নিবন্ধে আমরা ৫টি কার্যকরী টিপস শেয়ার করছি যা আপনার শেখার অভিজ্ঞতা উন্নত করবে।",
      date: "১৫ জুন, ২০২৩",
      author: "সৌম্য দাস",
      image: "/images/blog-french-tips.jpg",
      slug: "french-learning-tips"
    },
    {
      id: 2,
      title: "DELF পরীক্ষার প্রস্তুতি: একটি সম্পূর্ণ গাইড",
      excerpt: "DELF পরীক্ষা ফরাসি ভাষার দক্ষতা যাচাইয়ের একটি আন্তর্জাতিক মানদণ্ড। এই নিবন্ধে আমরা DELF পরীক্ষার বিভিন্ন স্তর, পরীক্ষার ফরম্যাট এবং প্রস্তুতির কৌশল নিয়ে আলোচনা করব।",
      date: "২৮ মে, ২০২৩",
      author: "রিয়া সেনগুপ্ত",
      image: "/images/blog-delf-guide.jpg",
      slug: "delf-exam-guide"
    },
    {
      id: 3,
      title: "ফরাসি সংস্কৃতি এবং ভাষা: একটি অদ্বিতীয় সম্পর্ক",
      excerpt: "ভাষা শেখা মানে শুধু ব্যাকরণ এবং শব্দভান্ডার মুখস্থ করা নয়, এর সাথে সংস্কৃতিও জড়িত। ফরাসি ভাষা শেখার সময় ফরাসি সংস্কৃতি সম্পর্কে জানা আপনার শেখার অভিজ্ঞতাকে সমৃদ্ধ করবে।",
      date: "১০ মে, ২০২৩",
      author: "অরিন্দম চক্রবর্তী",
      image: "/images/blog-french-culture.jpg",
      slug: "french-culture-and-language"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            ব্লগ ও নিউজ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ফরাসি ভাষা শেখার টিপস ও আপডেট
          </h2>
          <p className="text-lg text-gray-700">
            ফরাসি ভাষা শেখার টিপস, সংস্কৃতি এবং আমাদের স্কুলের সর্বশেষ আপডেট জানুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <User className="w-4 h-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700 mb-4">
                  {post.excerpt}
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                  <Link href={`/blog/${post.slug}`} className="flex items-center">
                    আরও পড়ুন <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            আরও পড়ুন
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আমাদের ব্লগে আরও অনেক কিছু রয়েছে
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            ফরাসি ভাষা শেখার টিপস, সংস্কৃতি, পরীক্ষার প্রস্তুতি এবং আমাদের স্কুলের সর্বশেষ আপডেট জানতে আমাদের ব্লগ অন্বেষণ করুন।
          </p>
          <Button asChild size="lg" className="px-8 py-3">
            <Link href="/blog">
              সব আর্টিকেল দেখুন
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default BlogSection