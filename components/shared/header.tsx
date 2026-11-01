// app/components/header.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Phone, Facebook, Youtube, Menu, X } from 'lucide-react'
import Link from 'next/link'
import HeaderLogo from './HeaderLogo'
import HeaderUser from './HeaderUser'

const Header = ({logo}:{logo:string}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section className=''>
      {/* Top Bar - Hidden on mobile */}
      <div className="header_top bg-primary text-white py-1 text-sm hidden md:block">
        <div className="header_top_inner container flex justify-between items-center">
          <div className="header_left flex gap-8">
            <div className='flex gap-2 items-center'>
              <a className='flex gap-2 items-center hover:text-muted' href="tel:+33753301875">Paris 18: <span className="flex items-center gap-1"> <Phone className='w-4 h-4' />07 53 30 18 75</span></a>
            </div>
            <div className='flex gap-2 items-center'>
              <a className='flex gap-2 items-center hover:text-muted' href="tel:+33756999085">Pantin Hoche: <span className="flex items-center gap-1"> <Phone className='w-4 h-4' />07 56 99 90 85</span></a>
            </div>
          </div>
          <div className="header_right">
            <div className="socials flex gap-2 items-center">
              <a href="https://www.facebook.com/dailyfrenchbybornomala/" className='border rounded p-1 block hover:text-muted' target='_blank'> <Facebook className='w-6 h-6 ' /> </a>
              <a href="https://www.youtube.com/channel/UC6o8HLJnUKj0bRwd5gKjKhg" className='border rounded p-1 block hover:text-muted' target='_blank'> <Youtube className='w-6 h-6 ' /> </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`main_header fixed top-0 w-full bg-white z-20 ${isScrolled ? 'md:fixed top-0 w-full' : 'md:relative'}`}>
        <div className={`container ${isScrolled ? "py-0" : "py-2"}`}>
          <div className="header_inner flex justify-between items-center relative">
            <div className="header_left">
              <HeaderLogo logo={logo} isScrolled={isScrolled} />
            </div>
            
            {/* Desktop Navigation */}
            <div className="header_right hidden md:block">
              <ul className='flex gap-2 items-center font-bold'>
                <li>
                  <Link className='hover:text-primary nav-underline px-2 py-1' href="/">Home</Link>
                </li>
                <li>
                  <Link className='hover:text-primary nav-underline px-2 py-1' href="/about">About</Link>
                </li>
                <li>
                  <Link className='hover:text-primary nav-underline px-2 py-1' href="/courses">Courses</Link>
                </li>
                <li>
                  <Link className='hover:text-primary nav-underline px-2 py-1' href="/success-stories">Success Stories</Link>
                </li>
                <li>
                  <Link className='hover:text-primary nav-underline px-2 py-1' href="/contact">Contact</Link>
                </li>
                <li>
                  <HeaderUser />
                </li>
              </ul>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-primary focus:outline-none" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
              <div className="absolute w-full left-0 top-full md:hidden bg-white shadow-lg h-[80vh] overflow-y-scroll border-t">
                <div className="container py-4">
                  <ul className='flex flex-col gap-3 font-bold'>
                    <li>
                      <Link 
                        className='block hover:text-primary nav-underline px-2 py-2 border-b' 
                        href="/" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className='block hover:text-primary nav-underline px-2 py-2 border-b' 
                        href="/about" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className='block hover:text-primary nav-underline px-2 py-2 border-b' 
                        href="/courses" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Courses
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className='block hover:text-primary nav-underline px-2 py-2 border-b' 
                        href="/success-stories" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Success Stories
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className='block hover:text-primary nav-underline px-2 py-2 border-b' 
                        href="/contact" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Contact
                      </Link>
                    </li>

                    {/* Mobile User Section (Replaces the man icon with structured list items) */}
                    <li className="pt-2">
                      <HeaderUser isMobile={true} onItemClick={() => setIsMenuOpen(false)} />
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex flex-col gap-3">
                      <a className='flex items-center gap-2 text-sm' href="tel:+33753301875">
                        <Phone className='w-4 h-4' /> Paris 18: 07 53 30 18 75
                      </a>
                      <a className='flex items-center gap-2 text-sm' href="tel:+33756999085">
                        <Phone className='w-4 h-4' /> Pantin Hoche: 07 56 99 90 85
                      </a>
                    </div>
                    
                    <div className="socials flex gap-3 mt-4">
                      <a href="https://www.facebook.com/dailyfrenchbybornomala/" className='border rounded p-2 block hover:text-muted' target='_blank'> <Facebook className='w-5 h-5 ' /> </a>
                      <a href="https://www.youtube.com/channel/UC6o8HLJnUKj0bRwd5gKjKhg" className='border rounded p-2 block hover:text-muted' target='_blank'> <Youtube className='w-5 h-5 ' /> </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Header