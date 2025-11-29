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
        "প্যারিস ১৮: ০৭ ৫৩ ৩০ ১৮ ৭৫",
        "প্যান্টিন হোশে: ০৭ ৫৬ ৯৯ ৯০ ৮৫"
      ]
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "ইমেল ঠিকানা",
      details: [
        "info@bornomala.com",
        "support@bornomala.com"
      ]
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "ঠিকানা",
      details: [
        "প্যারিস ক্যাম্পাস: ১২৩ রু ডি প্যারিস, ৭৫০১৮ প্যারিস",
        "প্যান্টিন ক্যাম্পাস: ৪৫৬ এভিনিউ ডি হোশে, ৯৩৫০০ প্যান্টিন"
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
    <section id="contact_section" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  বার্তা পাঠান
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
                    <Label htmlFor="message">বার্তা *</Label>
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
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="mr-4 mt-1">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        <ul className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <li key={idx} className="text-gray-700">
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

            <Card className="border-0 shadow-lg">
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
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection