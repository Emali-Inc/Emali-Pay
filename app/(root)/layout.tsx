import Sidebar from "@/components/Sidebar";

//The Root Layout was created by Nextjs
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn={firstName: 'Hillary',lastName: "Oyaro"}
  return (
    <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn}/>
        {children}
    </main>
  );
}
