'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log(formData)
    alert('আপনার বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "ফোন নম্বর",
      details: [
        "Paris 18: +33 7 53 30 18 75",
        "Pantin Hoche: 07 56 99 90 85"
      ]
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "ইমেল",
      details: [
        "contact.ecolebornomala@gmail.com ",
      ]
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "ঠিকানা",
      details: [
        "প্যারিস ক্যাম্পাস: 135 rue du mont Cenis 75018 Paris",
        "প্যান্টিন ক্যাম্পাস: 1 rue du pré saint Gervais 93500 Pantin "
      ]
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "সময়সূচী",
      details: [
        "সোমবার - শুক্রবার: সকাল ৯টা - রাত ৮টা",
        "শনিবার - রবিবার: সকাল ১০টা - সন্ধ্যা ৬টা"
      ]
    }
  ]

  return (
    <section id="contact_section" className="py-16 md:py-24 bg-primary-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Mail className="w-4 h-4 mr-2" />
            যোগাযোগ করুন
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-lg text-gray-700">
            আপনার প্রশ্ন বা মতামত আমাদের জানান। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0">
            {/* <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                 ইমেইল পাঠান
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">নাম *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ইমেল *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">বিষয় *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">মেসেজ *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    বার্তা পাঠান
                  </Button>
                </form>
              </CardContent>
            </Card> */}

            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2622.9542371499892!2d2.3467397999999995!3d48.8972093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66ef5436faf3d%3A0xa43e5f1c0edcf3df!2s135%20Rue%20du%20Mont-Cenis%2C%2075018%20Paris%2C%20France!5e0!3m2!1sen!2sbd!4v1765777897260!5m2!1sen!2sbd" width="600" height="450" className="border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>



          </div>

          {/* Contact Information */}
          <div data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <Card key={index} data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay={index * 100} className="border-0 shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4 ">
                      <div className="mr-4 mt-1">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        <ul className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <li key={idx} className="text-gray-700 break-all">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* <Card data-aos="fade-up" data-aos-offset="0" data-aos-duration="1000" data-aos-delay="0" className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  বিনামূল্যে পরামর্শের জন্য যোগাযোগ করুন
                </h3>
                <p className="text-gray-700 mb-6">
                  আপনি কোন কোর্সে ভর্তি হতে চান বা আপনার ফরাসি শেখার লক্ষ্য সম্পর্কে আলোচনা করতে চাইলে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার জন্য সঠিক পথ নির্বাচনে সাহায্য করব।
                </p>
                <Button className="w-full">
                  এখনই কল করুন
                </Button>
              </CardContent>
            </Card> */}



          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection