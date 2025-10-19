"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';

interface SessionOverviewData {
    date: string;
    scheduled: number;
    completed: number;
    cancelled: number;
}

interface EngagementData {
    level: string;
    count: number;
    color: string;
    [key: string]: any;
}

interface ProgressData {
    month: string;
    sessions: number;
    completed: number;
}

interface ChartData {
    sessionOverview: SessionOverviewData[];
    patientEngagement: EngagementData[];
    monthlyProgress: ProgressData[];
}

interface TherapistChartsProps {
    chartData: ChartData;
}

export function SessionOverviewChart({ data }: { data: SessionOverviewData[] }) {
    return (
        <Card className="bg-card/95 backdrop-blur border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Session Overview (Last 7 Days)
                </CardTitle>
                <CardDescription>
                    Daily breakdown of scheduled, completed, and cancelled sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                            dataKey="date" 
                            fontSize={12}
                            tick={{ fill: '#005f99' }} // Darker blue for Scheduled
                        />
                        <YAxis 
                            fontSize={12}
                            tick={{ fill: '#005f99' }} // Darker blue for Scheduled
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="scheduled" fill="#6ca9fdff" name="Scheduled" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="completed" fill="#855bbbff" name="Completed" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="cancelled" fill="#e77878ff" name="Cancelled" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function PatientEngagementChart({ data }: { data: EngagementData[] }) {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
        <Card className="bg-card/95 backdrop-blur border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Patient Engagement Levels
                </CardTitle>
                <CardDescription>
                    Distribution of patient engagement across all sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => {
                                const payload = props.payload as EngagementData;
                                const percent = props.percent as number | undefined;
                                return `${payload.level}: ${payload.count} (${((percent ?? 0) * 100).toFixed(0)}%)`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {totalCount === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        No engagement data available yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function MonthlyProgressChart({ data }: { data: ProgressData[] }) {
    return (
        <Card className="bg-card/95 backdrop-blur border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Monthly Progress (Last 6 Months)
                </CardTitle>
                <CardDescription>
                    Total sessions vs completed sessions over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                            dataKey="month" 
                            fontSize={12}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                            fontSize={12}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="sessions" 
                            stroke="#be98f0ff" 
                            strokeWidth={3}
                            name="Total Sessions"
                            dot={{ fill: '#be98f0ff', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="completed" 
                            stroke="#7847b7ff" 
                            strokeWidth={3}
                            name="Completed Sessions"
                            dot={{ fill: '#7847b7ff', strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TherapistCharts({ chartData }: TherapistChartsProps) {
    return (
        <div className="space-y-6">
            {/* Session Overview Chart */}
            <SessionOverviewChart data={chartData.sessionOverview} />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PatientEngagementChart data={chartData.patientEngagement} />
                <MonthlyProgressChart data={chartData.monthlyProgress} />
            </div>
        </div>
    );
}