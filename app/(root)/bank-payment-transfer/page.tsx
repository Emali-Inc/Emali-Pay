import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const BankTransfer = async () => {
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
        title="Emali Bank Payment Transfer."
        subtext="Please provide any specific detail or notes related to payment transfer."
      />

      <section className="size-full pt-5">
        <PaymentTransferForm accounts={accountsData}/>
      </section>
    </section>
  )
}

export default BankTransfer