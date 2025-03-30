import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <Header />
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto focus:outline-none pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
