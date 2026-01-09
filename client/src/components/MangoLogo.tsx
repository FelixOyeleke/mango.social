interface MangoLogoProps {
  className?: string;
  size?: number;
}

export default function MangoLogo({ className = '', size = 32 }: MangoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mango body */}
      <path
        d="M50 20C35 20 25 30 25 45C25 60 30 75 45 80C55 83 65 83 75 80C90 75 95 60 95 45C95 30 85 20 70 20C65 20 60 22 55 25C52 22 48 20 50 20Z"
        fill="url(#mangoGradient)"
      />
      
      {/* Leaf */}
      <path
        d="M55 15C55 15 60 10 65 12C70 14 72 20 70 25C68 30 62 32 58 30C54 28 53 22 55 15Z"
        fill="#22c55e"
      />
      
      {/* Highlight */}
      <ellipse
        cx="40"
        cy="35"
        rx="12"
        ry="18"
        fill="rgba(255, 255, 255, 0.3)"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="mangoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

