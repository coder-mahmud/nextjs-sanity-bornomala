import React from 'react'
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "হোম", href: "/" },
    { name: "আমাদের সম্পর্কে", href: "/about" },
    { name: "কোর্সসমূহ", href: "/courses" },
    { name: "ব্লগ", href: "/blog" },
    { name: "যোগাযোগ", href: "/contact" },
    { name: "ফলাফল", href: "/result" },
    { name: "DELF পরীক্ষা", href: "/exam" }
  ]

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "ফোন নম্বর",
      details: [
        "প্যারিস ১৮: ০৭ ৫৩ ৩০ ১৮ ৭৫",
        "প্যান্টিন হোশে: ০৭ ৫৬ ৯৯ ৯০ ৮৫"
      ]
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "ইমেল ঠিকানা",
      details: [
        "info@bornomala.com",
        "support@bornomala.com"
      ]
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "ঠিকানা",
      details: [
        "প্যারিস ক্যাম্পাস: ১২৩ রু ডি প্যারিস, ৭৫০১৮ প্যারিস",
        "প্যান্টিন ক্যাম্পাস: ৪৫৬ এভিনিউ ডি হোশে, ৯৩৫০০ প্যান্টিন"
      ]
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "সময়সূচী",
      details: [
        "সোমবার - শুক্রবার: সকাল ৯টা - রাত ৮টা",
        "শনিবার - রবিবার: সকাল ১০টা - সন্ধ্যা ৬টা"
      ]
    }
  ]

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "https://www.facebook.com/dailyfrenchbybornomala/" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, href: "https://www.youtube.com/channel/UC6o8HLJnUKj0bRwd5gKjKhg" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" }
  ]

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Image src="/images/logo.jpg" alt="Logo" width={120} height={120} className="w-auto h-12" />
              </Link>
            </div>
            <p className="text-gray-300 mb-6">
              বর্ণমালা ফরাসি ভাষা স্কুলে আমরা ব্যক্তিগতকৃত ফরাসি ভাষা কোচিং প্রদান করি। আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীকে ফরাসি ভাষায় দক্ষতা অর্জনে সাহায্য করা।
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-primary p-2 rounded-full transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">দ্রুত লিংক</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">যোগাযোগের তথ্য</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-start mb-2">
                    <div className="mr-3 mt-1">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300">{info.title}</h4>
                      <ul className="mt-1">
                        {info.details.map((detail, idx) => (
                          <li key={idx} className="text-gray-400 text-sm">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-lg font-bold mb-2">নিউজলেটার সাবস্ক্রাইব করুন</h3>
              <p className="text-gray-400 text-sm">
                আমাদের কোর্স, ইভেন্ট এবং অফার সম্পর্কে আপডেট পেতে সাইন আপ করুন
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto">
              <input 
                type="email" 
                placeholder="আপনার ইমেল ঠিকানা" 
                className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 w-full sm:w-auto"
              />
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-r-lg font-medium transition-colors duration-300 mt-2 sm:mt-0">
                সাবস্ক্রাইব
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} বর্ণমালা ফরাসি ভাষা স্কুল। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                গোপনীয়তা নীতি
              </Link>
              <Link href="/terms-conditions" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                শর্তাবলী
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer