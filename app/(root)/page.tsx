import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';

const Home = () => {
    const loggedIn = { firstName: 'Hillary' , lastName: 'Oyaro' , email: 'hillaryoyaro@emali.co.ke'};

  return (
    <section className="home">
        <div className="home-content">
            <header className="home-header">
                <HeaderBox
                type="greeting"
                title="Welcome"
                user={loggedIn?.firstName || 'Guest'}
                subtext="Acess and manage your account and transactions efficiently."
                />
                <TotalBalanceBox
                  accounts={[]}
                  totalBanks={1}
                  totalCurrentBalance={1250.35}
                />
            </header>
            RECENT TRANSACTIONS
        </div>
        <RightSidebar 
          user={loggedIn} 
          transactions={[]} 
          banks={[{},{}]}
        />
    </section>
  )
}

export default Home