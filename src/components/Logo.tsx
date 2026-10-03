import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon' | 'badge';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  variant = 'full',
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  if (variant === 'badge') {
    return (
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-md ${sizeClasses[size]} ${className}`}>
        <img
          src="/logo.jpg"
          alt="Bismillah Motors Logo"
          className="h-full w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      {/* Official Motorcycle Emblem from logo */}
      <div className={`relative rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-md shrink-0 flex items-center justify-center p-0.5 ${sizeClasses[size]} aspect-square`}>
        <img
          src="/logo.jpg"
          alt="Bismillah Motors - Experience the Quality"
          className="h-full w-full object-contain"
        />
      </div>

      {variant === 'full' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 font-sans uppercase">
              Bismillah <span className="text-red-600">Motors</span>
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                Experience the Quality
              </span>
              <span className="text-[10px] font-bold text-gray-400 hidden sm:inline">
                • Jashore Sadar
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
