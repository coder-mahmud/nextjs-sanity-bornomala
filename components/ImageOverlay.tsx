'use client'
import Image from "next/image"
import { X } from "lucide-react"

import { useState } from "react"

const ImageOverlay = ({text,imageUrl}:{text:string, imageUrl:string}) => {
  const [showOverlay, setShowOverlay] = useState(false)
  const showImage = () => setShowOverlay(true)
  const hideImage = () => setShowOverlay(false)

  return (
    <div className="relative">
      <button onClick={showImage} className="bg-green-500 text-white px-3 py-1 rounded text-center cursor-pointer">{text}</button>

      <div className={`overlay ${showOverlay ? 'visible' : 'hidden'} fixed  w-full h-full left-0 top-0  bg-gray-500 z-20 flex items-center justify-center`}>
        <div className="overlayInner h-[90vh] w-full flex items-center justify-center relative">\
          <div className="image_wrapper relative h-[85vh]">
            <X onClick={hideImage} className="w-12 h-12 text-white cursor-pointer border-2 rounded p-2 absolute right-0 top-0 bg-black" />
            <Image src={imageUrl} alt={text} width={300} height={200} className="h-full w-auto" />
          </div>
        </div>

      </div>    
    </div>
  )
}

export default ImageOverlay