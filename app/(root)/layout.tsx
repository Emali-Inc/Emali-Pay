//The Root Layout was created by Nextjs
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        SIDEBAR 
        {children}
    </main>
  );
}
