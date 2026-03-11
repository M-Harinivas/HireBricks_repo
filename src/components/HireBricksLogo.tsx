import { Link } from 'react-router-dom';

interface HireBricksLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

export const HireBricksLogo = ({ size = 'md', variant = 'default' }: HireBricksLogoProps) => {
  const logoHeight = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';
  const isLight = variant === 'light';

  return (
    <Link to="/" className={`${textSize} font-bold tracking-tight flex items-center gap-2 shrink-0`}>
      <img
        src="/logo.png"
        alt="Logo"
        className="object-contain"
        style={{ height: `${logoHeight}px` }}
      />
      <span>
        <span style={{ color: isLight ? '#FFFFFF' : '#1B3B6F' }}>Hire</span>
        <span style={{ color: '#F97316' }}>Bricks</span>
      </span>
    </Link>
  );
};
