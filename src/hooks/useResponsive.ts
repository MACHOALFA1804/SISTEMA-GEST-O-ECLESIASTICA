import { useState, useEffect } from 'react';

// Breakpoints baseados no Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  breakpoint: BreakpointKey;
  isTouch: boolean;
}

// Hook principal para responsividade
export const useResponsive = (): ResponsiveInfo => {
  const [responsiveInfo, setResponsiveInfo] = useState<ResponsiveInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        orientation: 'landscape',
        breakpoint: 'lg',
        isTouch: false
      };
    }

    return calculateResponsiveInfo();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setResponsiveInfo(calculateResponsiveInfo());
    };

    const handleOrientationChange = () => {
      // Timeout para aguardar a mudança de orientação ser concluída
      setTimeout(() => {
        setResponsiveInfo(calculateResponsiveInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return responsiveInfo;
};

// Função para calcular informações responsivas
function calculateResponsiveInfo(): ResponsiveInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = width > height ? 'landscape' : 'portrait';
  
  // Detectar se é dispositivo touch
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Determinar breakpoint
  let breakpoint: BreakpointKey = 'sm';
  if (width >= breakpoints['2xl']) breakpoint = '2xl';
  else if (width >= breakpoints.xl) breakpoint = 'xl';
  else if (width >= breakpoints.lg) breakpoint = 'lg';
  else if (width >= breakpoints.md) breakpoint = 'md';
  else if (width >= breakpoints.sm) breakpoint = 'sm';

  // Determinar tipo de dispositivo
  let deviceType: DeviceType;
  let isMobile = false;
  let isTablet = false;
  let isDesktop = false;

  if (width < breakpoints.md) {
    deviceType = 'mobile';
    isMobile = true;
  } else if (width < breakpoints.lg) {
    deviceType = 'tablet';
    isTablet = true;
  } else {
    deviceType = 'desktop';
    isDesktop = true;
  }

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    orientation,
    breakpoint,
    isTouch
  };
}

// Hook para classes CSS condicionais
export const useResponsiveClasses = () => {
  const responsive = useResponsive();

  return {
    // Classes para containers
    container: `mx-auto px-4 ${
      responsive.isMobile ? 'max-w-full' :
      responsive.isTablet ? 'max-w-4xl px-6' :
      'max-w-7xl px-8'
    }`,

    // Classes para grids
    grid: {
      auto: `grid ${
        responsive.isMobile ? 'grid-cols-1' :
        responsive.isTablet ? 'grid-cols-2' :
        'grid-cols-3'
      } gap-4`,
      
      cards: `grid ${
        responsive.isMobile ? 'grid-cols-1' :
        responsive.isTablet ? 'grid-cols-2' :
        'grid-cols-4'
      } gap-6`,

      dashboard: `grid ${
        responsive.isMobile ? 'grid-cols-1' :
        responsive.isTablet ? 'grid-cols-2 lg:grid-cols-3' :
        'grid-cols-3 xl:grid-cols-4'
      } gap-6`,

      table: `${
        responsive.isMobile ? 'overflow-x-auto' : ''
      }`
    },

    // Classes para texto
    text: {
      title: `font-bold ${
        responsive.isMobile ? 'text-xl' :
        responsive.isTablet ? 'text-2xl' :
        'text-3xl'
      }`,
      
      subtitle: `${
        responsive.isMobile ? 'text-sm' :
        responsive.isTablet ? 'text-base' :
        'text-lg'
      }`,

      body: `${
        responsive.isMobile ? 'text-sm' :
        'text-base'
      }`
    },

    // Classes para espaçamento
    spacing: {
      section: `${
        responsive.isMobile ? 'py-4' :
        responsive.isTablet ? 'py-6' :
        'py-8'
      }`,
      
      card: `${
        responsive.isMobile ? 'p-4' :
        'p-6'
      }`
    },

    // Classes para navegação
    navigation: {
      header: `${
        responsive.isMobile ? 'px-4 py-3' :
        'px-6 py-4'
      }`,
      
      sidebar: `${
        responsive.isMobile ? 'fixed inset-0 z-50' :
        'relative'
      }`
    }
  };
};

// Hook para verificar breakpoints específicos
export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const { width } = useResponsive();
  return width >= breakpoints[breakpoint];
};

// Hook para orientação
export const useOrientation = (): 'portrait' | 'landscape' => {
  const { orientation } = useResponsive();
  return orientation;
};

// Hook para verificar se é dispositivo móvel
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

// Hook para verificar se é dispositivo touch
export const useIsTouch = (): boolean => {
  const { isTouch } = useResponsive();
  return isTouch;
};

// Utilitário para classes condicionais (função pura, não hook)
export const getResponsiveClass = (
  screenWidth: number,
  mobileClass: string,
  tabletClass?: string,
  desktopClass?: string
) => {
  if (screenWidth < 768) return mobileClass;
  if (screenWidth < 1024 && tabletClass) return tabletClass;
  if (screenWidth >= 1024 && desktopClass) return desktopClass;
  
  return tabletClass || mobileClass;
};
