import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <div className="pt-8 sm:pt-16 pb-8 sm:pb-16 text-center space-y-6 sm:space-y-8 min-h-[80vh] sm:min-h-screen flex flex-col items-center justify-center px-4">
            <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                    🧠 Specialized ADHD Support for Sri Lanka
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight px-2">
                    Hello,{" "}
                    <br className="block sm:hidden" />
                    I&apos;m{" "}
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        SPARKS
                    </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
                    I&apos;m here to help individuals with ADHD, their families, and healthcare professionals
                    navigate the journey with tools designed specifically for Sri Lankan communities.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto px-4">
                <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-primary hover:bg-primary/90">
                        Begin Your Journey
                    </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    );
}
