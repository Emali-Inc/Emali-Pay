import { logoutAccount } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Footer = ({ user, type = 'desktop' }: FooterProps) => {
    //Initialize the router from next navigation
    const router  = useRouter();
    //Call handleOnClick function which will be Onclick function
    const handleLogOut = async () => {
        const loggedOut = await logoutAccount();
        //if loggedOut push router to signIn
        if(loggedOut) router.push('/sign-in')
    }
  return (
    <footer className="footer">
        <div className={ type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
            <p className="text-xl font-bold text-gray-700">
                {user?.firstName[0]}
            </p>
        </div>
        <div className={ type === 'mobile' ? 'footer_email-name-mobile' : 'footer_email-name'}>
            <h1 className="text-14 truncate text-normal  text-gray-700 font-semibold">
                {user?.firstName}
            </h1>
            <p className="text-14 truncate text-normal font-normal text-gray-600">
                {user?.email}
            </p>
        </div>

        <div className="footer_image" onClick={handleLogOut}>
            <Image src="icons/logout.svg" fill alt="jsm"/>
        </div>
    </footer>
  )
}

export default Footer