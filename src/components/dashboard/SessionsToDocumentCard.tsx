"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionsToDocumentProps {
    count: number;
}

export function SessionsToDocumentCard({ count }: SessionsToDocumentProps) {
    const router = useRouter();

    const handleViewSessions = () => {
        router.push("/therapist/sessions");
    };

    return (
        <Card className="bg-gradient-to-r from-orange-50/95 to-orange-100/50 border-orange-200/50 shadow-lg backdrop-blur dark:from-orange-950/95 dark:to-orange-900/50 dark:border-orange-800/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                                Sessions to Document
                            </CardTitle>
                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                Completed sessions requiring documentation
                            </p>
                        </div>
                    </div>
                    <Badge 
                        variant={count > 0 ? "destructive" : "secondary"}
                        className={`text-lg px-3 py-1 ${
                            count > 0 
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                    >
                        {count}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-orange-700 dark:text-orange-300">
                        <Clock className="h-4 w-4" />
                        <span>
                            {count > 0 
                                ? `${count} session${count > 1 ? 's' : ''} need${count === 1 ? 's' : ''} documentation`
                                : "All sessions are up to date"
                            }
                        </span>
                    </div>
                    
                    {count > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-950/50 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                                These sessions have passed their scheduled end time but are still marked as scheduled. 
                                Please update them with session notes and completion status.
                            </p>
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleViewSessions}
                        className={`w-full ${
                            count > 0 
                                ? "bg-orange-600 hover:bg-orange-700 text-white" 
                                : "bg-green-600 hover:bg-green-700 text-white"
                        } transition-colors group`}
                    >
                        <span>View All Sessions</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}