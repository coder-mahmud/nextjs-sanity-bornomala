import React from 'react'
import Image from 'next/image'
import Link from 'next/link'




const HeaderLogo = ({isScrolled, logo}:{isScrolled:any, logo:string}) => {
  // const options = await getSiteOpions();
  // console.log("header options", options)
  return (
      <Link href="/">
        <Image src={logo} alt="Logo" width={120} height={150}  className={`w-auto  transition-transform duration-200 origin-left ${isScrolled ? 'scale-75' : 'scale-100'} max-w-[170px] lg:max-w-none lg:h-16 lg:w-auto`}  />
      </Link>
  )
}

export default HeaderLogo