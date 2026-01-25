'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Facebook, X, Plus } from 'lucide-react'

export default function FloatingContact() {
  const [open, setOpen] = useState(true)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3">
      {/* If expanded, show full icons; else, show only the plus icon */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition hover:scale-110 cursor-pointer"
          aria-label="Open contact options"
        >
          <Plus size={24} />
        </button>
      ) : (
        <>
          {/* Phone */}
          <a
            href="tel:+330753301875"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110"
            aria-label="Call us"
          >
            <Phone size={22} />
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/+330753301875"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:scale-110"
            aria-label="WhatsApp"
          >
            <MessageCircle size={22} />
          </a>

          {/* Messenger */}
          <a
            href="https://www.messenger.com/t/100543482508253"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-110 cursor-pointer"
            aria-label="Messenger"
          >
            <Facebook size={22} />
          </a>

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-110 cursor-pointer"
            aria-label="Close contact options"
          >
            <X size={20} />
          </button>
        </>
      )}
    </div>
  )
}
