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

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    // Staggered animation sequence
    const contentTimer = setTimeout(() => setIsVisible(true), 600);
    const buttonsTimer = setTimeout(() => setButtonsVisible(true), 1200);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  return (
    <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-3xl"></div>
        <div className="absolute bottom-32 right-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 blur-xl"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float-1"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-float-2"></div>
        <div className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-float-3"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Main Content */}
        <div
          className={`mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Transform your{" "}
            <span
              className="relative inline-block"
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ADHD journey
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
                ADHD journey
              </div>
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light mb-8">
            We understand the unique challenges of ADHD in Sri Lanka. SPARKS
            helps you develop personalized strategies, connect with support
            networks, and build a thriving life.
          </p>

          <div className="flex items-center justify-center mb-8">
            <div className="text-lg font-medium" style={{ color: "#8159A8" }}>
              Ready to take control of your journey?
            </div>
          </div>

          {/* Visual separator */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div
          className={`transition-all duration-800 ${
            buttonsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <Link href="/signup" className="w-full sm:w-auto group">
              <div className="relative">
                {/* Enhanced glow effect */}
                <div
                  className="absolute -inset-1 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"
                  style={{ backgroundColor: "#8159A8" }}
                ></div>

                {/* Main button */}
                <Button
                  size="lg"
                  className="relative w-full sm:w-auto text-xl px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold whitespace-nowrap"
                  style={{
                    backgroundColor: "#8159A8",
                    borderColor: "#8159A8",
                  }}
                >
                  Start Your SPARKS Journey
                </Button>
              </div>
            </Link>

            <Link href="/login" className="w-full sm:w-auto group">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-xl px-12 py-6 rounded-2xl border-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium bg-white/80 backdrop-blur-sm whitespace-nowrap"
                style={{
                  borderColor: "#8159A8",
                  color: "#8159A8",
                }}
              >
                I Already Have an Account
              </Button>
            </Link>
          </div>

          {/* Bottom tagline */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">
              Join thousands transforming their lives with{" "}
              <span className="font-bold" style={{ color: "#8159A8" }}>
                SPARKS
              </span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .opacity-3 {
          opacity: 0.03;
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

        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) translateX(5px) rotate(90deg);
          }
          50% {
            transform: translateY(-5px) translateX(-5px) rotate(180deg);
          }
          75% {
            transform: translateY(5px) translateX(10px) rotate(270deg);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(8px) translateX(-8px) rotate(120deg);
          }
          66% {
            transform: translateY(-8px) translateX(8px) rotate(240deg);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) translateX(6px) rotate(180deg);
          }
        }

        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 6s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float-3 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
