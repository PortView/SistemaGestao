import Header from "./header";
import { useEffect } from "react";
import { useTheme } from "next-themes";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();
  
  // Registrar o tema no console para debug
  useEffect(() => {
    console.log(`Aplicação renderizada com tema ${theme}`);
  }, [theme]);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Header />
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto focus:outline-none pt-16">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
