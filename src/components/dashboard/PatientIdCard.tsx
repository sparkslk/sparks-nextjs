"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, User, Shield } from "lucide-react";

interface PatientIdCardProps {
    patientId: string;
    userId: string;
    firstName: string;
    lastName: string;
}

export function PatientIdCard({ patientId, userId, firstName, lastName }: PatientIdCardProps) {
    const [copiedPatient, setCopiedPatient] = useState(false);
    const [copiedUser, setCopiedUser] = useState(false);

    const copyPatientIdToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(patientId);
            setCopiedPatient(true);
            setTimeout(() => setCopiedPatient(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const copyUserIdToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(userId);
            setCopiedUser(true);
            setTimeout(() => setCopiedUser(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Patient Information
                </CardTitle>
                <CardDescription>
                    Your unique patient identification details
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Patient ID Section */}
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Patient ID</span>
                        </div>
                        <div className="font-mono text-base font-bold text-gray-900 dark:text-gray-100 tracking-wide break-all">
                            {patientId}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPatientIdToClipboard}
                        className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/50 ml-2"
                    >
                        {copiedPatient ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* User ID Section */}
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">User ID</span>
                        </div>
                        <div className="font-mono text-base font-bold text-gray-900 dark:text-gray-100 tracking-wide break-all">
                            {userId}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyUserIdToClipboard}
                        className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50 ml-2"
                    >
                        {copiedUser ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* Name Display */}
                <div className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg border border-gray-200/30 dark:border-gray-700/30">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Patient Name</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {firstName} {lastName}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                            Important Information
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                            <strong>Patient ID:</strong> Share with family members to connect accounts.<br />
                            <strong>User ID:</strong> Use for password reset if you forget your password.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Shield className="h-3 w-3 mr-1" />
                        Secure
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <User className="h-3 w-3 mr-1" />
                        Verified Patient
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
