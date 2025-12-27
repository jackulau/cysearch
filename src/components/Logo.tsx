interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "h-8 w-8", text: "text-lg" },
  md: { icon: "h-10 w-10", text: "text-xl" },
  lg: { icon: "h-14 w-14", text: "text-2xl" },
  xl: { icon: "h-20 w-20", text: "text-3xl" },
};

export function Logo({ size = "sm", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon className={icon} />
      {showText && (
        <span className={`font-bold text-gray-900 ${text}`}>CySearch</span>
      )}
    </div>
  );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect width="64" height="64" rx="14" fill="#C8102E" />

      {/* Magnifying glass lens */}
      <circle
        cx="28"
        cy="28"
        r="16"
        stroke="#FFFFFF"
        strokeWidth="4"
        fill="none"
      />

      {/* CY text inside the lens */}
      <text
        x="28"
        y="34"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        fontSize="18"
        fill="#FFFFFF"
      >
        CY
      </text>

      {/* Gold accent arc on top of lens */}
      <path
        d="M 16 20 A 16 16 0 0 1 40 20"
        stroke="#F1BE48"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Magnifying glass handle */}
      <line
        x1="40"
        y1="40"
        x2="54"
        y2="54"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Gold accent on handle */}
      <line
        x1="44"
        y1="44"
        x2="50"
        y2="50"
        stroke="#F1BE48"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoIconSimple({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="32" height="32" rx="6" fill="#C8102E" />

      {/* CY Letters */}
      <text
        x="4"
        y="24"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="20"
        fill="#FFFFFF"
      >
        CY
      </text>

      {/* Gold underline accent */}
      <rect x="4" y="26" width="24" height="2.5" rx="1" fill="#F1BE48" />
    </svg>
  );
}
