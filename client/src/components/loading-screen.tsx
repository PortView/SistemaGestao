import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinishLoading?: () => void;
  loadingTime?: number;
}

export function LoadingScreen({ 
  onFinishLoading, 
  loadingTime = 2000 
}: LoadingScreenProps) {
  const [opacity, setOpacity] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Efeito de pulsação
    const pulseInterval = setInterval(() => {
      setOpacity((prev) => (prev === 1 ? 0.8 : 1));
    }, 800);

    // Simulação de progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Acelera o progresso no final para parecer mais natural
        const increment = prev < 70 ? 5 : (prev < 90 ? 2 : 1);
        return Math.min(prev + increment, 99);
      });
    }, 100);

    // Timer para finalizar o carregamento
    const timer = setTimeout(() => {
      setProgress(100);
      
      setTimeout(() => {
        setIsExiting(true);
        
        // Aguardar a animação de saída antes de chamar o callback
        setTimeout(() => {
          if (onFinishLoading) {
            onFinishLoading();
          }
        }, 500);
      }, 300);
    }, loadingTime);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [loadingTime, onFinishLoading]);

  return (
    <div
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        className="text-center transition-opacity duration-800 w-80"
        style={{ opacity }}
      >
        <div className="w-32 h-32 mb-6 mx-auto relative">
          {/* Logo animado do SISCOP */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-40 animate-ping" 
               style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-blue-500"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">SISCOP</h2>
        <p className="text-lg text-gray-300 mb-4">Aguarde o carregamento do sistema...</p>
        
        {/* Barra de progresso */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400">{progress}%</p>
      </div>
    </div>
  );
}
