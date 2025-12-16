import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkToHome?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: 32, text: "text-lg" },
  md: { img: 40, text: "text-xl" },
  lg: { img: 56, text: "text-2xl" },
  xl: { img: 80, text: "text-3xl" },
};

export default function Logo({ 
  size = "md", 
  showText = true, 
  linkToHome = true,
  className = ""
}: LogoProps) {
  const { img, text } = sizes[size];
  
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="MySimsar"
        width={img}
        height={img}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={`${text} font-bold text-gray-900`}>MySimsar</span>
      )}
    </div>
  );

  if (linkToHome) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}

// Simple logo for headers (no text option)
export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/images/logo.png"
      alt="MySimsar"
      width={size}
      height={size}
      className="object-contain"
      priority
    />
  );
}

