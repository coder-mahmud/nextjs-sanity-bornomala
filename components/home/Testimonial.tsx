import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote, } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Testimonial = {
  name: string
  testimonialText: string
  rating:string
  image?: {
    node: {
      sourceUrl: string
      altText?: string
    }
  }
}

type TestimonialsSectionProps = {
  testimonials: Testimonial[]
  subtitleBelowTestimonials:string
}


const TestimonialsSection = ({testimonials,subtitleBelowTestimonials} : TestimonialsSectionProps ) => {

  // console.log("Testimonials:", testimonials)
  /*
  const testimonials = [
    {
      id: 1,
      name: "বোরহান উদ্দিন",
      role: "বিশ্ববিদ্যালয় শিক্ষার্থী",
      content: "আমি মাত্র ছয় মাসের কোর্সে ফরাসি ভাষায় দক্ষতা অর্জন করেছি। আমার টিউটর ছিলেন অত্যন্ত অভিজ্ঞ এবং তিনি আমার দুর্বলতাগুলো বুঝতে পেরেছিলেন। এখন আমি আত্মবিশ্বাসের সাথে ফরাসি বলতে পারি।",
      rating: 5,
      image: "/images/student1.jpg"
    },
    {
      id: 2,
      name: "রুবেল হাসান",
      role: "পেশাদার অনুবাদক",
      content: "আমার কাজের জন্য ফরাসি ভাষা শেখা অত্যন্ত গুরুত্বপূর্ণ ছিল। এখানকার ব্যক্তিগত কোচিং আমাকে আমার পেশাগত লক্ষ্য অর্জনে সাহায্য করেছে। আমি এখন ফরাসি থেকে বাংলায় অনুবাদ করতে পারি খুব সহজেই।",
      rating: 5,
      image: "/images/student2.jpg"
    },
    {
      id: 3,
      name: "মোহসিনা রিমু",
      role: "চাকুরিপ্রার্থী",
      content: "ফ্রান্সে উচ্চশিক্ষার জন্য আমার TEF পরীক্ষার প্রস্তুতি দরকার ছিল। এখানকার বিশেষ পরীক্ষা প্রস্তুতি কোর্স আমাকে CLB B2 স্কোর অর্জনে সাহায্য করেছে। আমি এখন ফ্রান্সে আমার স্বপ্নের বিশ্ববিদ্যালয়ে পড়াশোনা করছি।",
      rating: 5,
      image: "/images/student3.jpg"
    }
  ]
    */

  const renderStars = (rating: any ) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Quote className="w-4 h-4 mr-2" />
            শিক্ষার্থীদের মতামত
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের শিক্ষার্থীরা কী বলেন
          </h2>
          <p className="text-lg text-gray-700">
            আমাদের কোচিং প্রোগ্রামের মাধ্যমে শিক্ষার্থীদের সাফল্যের গল্প
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial,idx) => (
            <Card key={idx} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={idx*100} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {renderStars(+testimonial?.rating)}
                </div>
                <div className="text-gray-700 mb-6 italic">
                  
                <div className="testimonial-text flex gap-1">
                  <span className="quote">“</span>

                  <span
                    dangerouslySetInnerHTML={{
                      __html: testimonial.testimonialText,
                    }}
                  />

                  <span className="quote">”</span>
                </div>
                </div>
                
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  {testimonial.image?.node?.sourceUrl && (
                    // <Image
                    //   src={testimonial.image.node.sourceUrl}
                    //   alt={testimonial.image.node.altText || ""}
                    //   width={80}
                    //   height={80}
                    // />
                    <Image
                    src={testimonial.image.node.sourceUrl}
                    alt={testimonial.image.node.altText || ""}
                    width={80}
                    height={80}
                    unoptimized
                    className='object-contain'
                  />

                  )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    {/* <p className="text-sm text-gray-600">{testimonial.role}</p> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="mt-16 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            {subtitleBelowTestimonials}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            আপনিও আমাদের সাফল্যের অংশ হন
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            আমাদের শিক্ষার্থীদের মতো আপনিও ফরাসি ভাষায় দক্ষতা অর্জন করুন এবং আপনার লক্ষ্য পূরণ করুন।
          </p>
          <a href="#contact_section" className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            আজই যোগ দিন
          </a>
        </div>
      </div>
      
      {/* Wave Separator */}
      {/* <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-12 md:h-16 lg:h-20">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,90.7C960,96,1056,96,1152,90.7C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div> */}
    </section>
  )
}

export default TestimonialsSection