import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CTASection() {
    return (
        <section className="py-8 sm:py-12 md:py-16 text-center px-4">
            <div className="max-w-4xl mx-auto">
                <Badge variant="secondary" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                    THIS IS SPARKS
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2">
                    Transform your ADHD journey
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
                    We understand the unique challenges of ADHD in Sri Lanka. SPARKS helps you develop
                    personalized strategies, connect with support networks, and build a thriving life.
                    Ready to take control of your journey?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto">
                    <Link href="/signup" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-primary hover:bg-primary/90">
                            Start Your SPARKS Journey
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                            I Already Have an Account
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
