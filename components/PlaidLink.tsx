import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';


const PlaidLink = ({user,variant}: PlaidLinkProps) => {
    const router = useRouter();
    const [token, setToken] = useState('');

    //Use useEffect to fetch the token on time--it can be used as call back function and
    //Provide dependencie array when you want that function to be recalled
    useEffect(() => {
      const getLinkToken = async () => {
        const data = await createLinkToken(user);
        setToken(data?.linkToken);
      }
      getLinkToken();
    }, [user]);
    
    const onSuccess = useCallback<PlaidLinkOnSuccess>( async (public_token:string) => {
        await exchangePublicToken({
            publicToken: public_token,
            user,
        })
       router.push('/');
    },[user])

    const config: PlaidLinkOptions = {
        token,
        onSuccess
    }
    //Destructure the props to useplaidLink
    const { open,ready } = usePlaidLink(config);

  return (
    <> 
        {variant === 'primary' ? (
            <Button 
                onClick={() => open()}
                disabled={!ready}
                className="plaidlink-primary"
            >
                Connect Bank
            </Button>
        ): variant === 'ghost' ? (
            <Button>
                Connect Bank
            </Button>
        ): (
            <Button>
                Connect Bank
            </Button>
        )}
    </>
  )
}

export default PlaidLink