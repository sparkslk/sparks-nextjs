import { useState, useEffect } from "react";

// Mock Next.js Link component for demo
const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={href} className={className}>
    {children}
  </a>
);

// Mock Button component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    "Personalized ADHD Support",
    "Sri Lankan Community Focus",
    "Evidence-Based Tools",
    "Family & Professional Resources",
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
      style={{ backgroundColor: "#F5F3FB" }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-primary to-purple-400 blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-gradient-to-r from-primary to-blue-400 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-pink-400 blur-xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-4xl mx-auto text-center space-y-8 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            Hello,
            <br />
            I&apos;m{" "}
            <span
              className="relative inline-block"
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SPARKS
              {/* Subtle glow effect */}
              <div
                className="absolute inset-0 blur-lg opacity-20"
                style={{
                  background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                SPARKS
              </div>
            </span>
          </h1>

          {/* Animated feature text */}
          <div className="h-8 flex items-center justify-center">
            <p
              key={currentFeature}
              className="text-lg font-medium animate-fade-in"
              style={{ color: "#8159A8" }}
            >
              {features[currentFeature]}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          Empowering individuals with ADHD, their families, and healthcare
          professionals with culturally-aware tools and resources designed for
          Sri Lankan communities.
        </p>

        {/* Clear Visual Separator */}
        <div className="py-4">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              style={{
                backgroundColor: "#8159A8",
                borderColor: "#8159A8",
              }}
            >
              ✨ Begin Your Journey
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4 rounded-lg border-2 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
              style={{
                borderColor: "#8159A8",
                color: "#8159A8",
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .bg-primary {
          background-color: #8159a8;
        }

        .text-primary {
          color: #8159a8;
        }

        .border-primary {
          border-color: #8159a8;
        }

        .hover\\:bg-primary\\/90:hover {
          background-color: rgba(129, 89, 168, 0.9);
        }
      `}</style>
    </div>
  );
}
