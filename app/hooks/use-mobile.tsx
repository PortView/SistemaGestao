'use client';

import React, { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verifica inicialmente
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    
    // Adiciona o evento de resize
    window.addEventListener('resize', checkMobile);
    
    // Checa no primeiro render
    checkMobile();
    
    // Limpa o evento
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}