import HeaderBox from '@/components/HeaderBox'
import MpesaTransferForm from '@/components/MpesaTransferForm';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const MpesaTransfer = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ 
    userId: loggedIn.$id 
  })

    //if not accounts exit from this function not return the home page
  if(!accounts) return;
  
  const accountsData = accounts?.data;
 
  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Emali Pay Mpesa Transfer."
        subtext="Please provide any specific detail or notes related to mpesa transfer."
      />

      <section className="size-full pt-5">
        <MpesaTransferForm accounts={accountsData}/>
      </section>
    </section>
  )
}

export default MpesaTransfer