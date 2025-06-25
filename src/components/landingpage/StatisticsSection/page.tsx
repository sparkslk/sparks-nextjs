import { Badge } from "@/components/ui/badge";

interface StatisticProps {
    value: string;
    label: string;
    description: string;
}

const Statistic = ({ value, label, description }: StatisticProps) => (
    <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border hover:shadow-md transition-shadow">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">{value}</div>
        <div className="font-semibold text-foreground mb-1 text-sm sm:text-base">{label}</div>
        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</div>
    </div>
);

export default function StatisticsSection() {
    return (
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-primary/5 to-purple-50/30 rounded-2xl sm:rounded-3xl my-8 sm:my-12 md:my-16 mx-4 sm:mx-auto w-auto sm:w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
                <Badge variant="secondary" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                    ADHD IN SRI LANKA
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                    Real Support for Real Challenges
                </h2>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
                <Statistic
                    value="5-6%"
                    label="Population affected"
                    description="Of Sri Lanka's population is estimated to have ADHD"
                />
                <Statistic
                    value="Limited"
                    label="Access to diagnosis"
                    description="Many people, especially outside cities, lack proper support"
                />
                <Statistic
                    value="0"
                    label="Specialized apps"
                    description="No existing digital app designed for ADHD in Sri Lanka"
                />
            </div>
        </section>
    );
}
