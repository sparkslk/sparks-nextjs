"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, UserCheck } from "lucide-react";

interface ConnectChildFormProps {
    onSuccess: () => void;
}

export function ConnectChildForm({ onSuccess }: ConnectChildFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        patientId: "",
        relationship: "",
        isPrimary: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            relationship: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/parent/children/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patientId: formData.patientId.trim(),
                    relationship: formData.relationship,
                    isPrimary: formData.isPrimary
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to connect to child");
            }

            const result = await response.json();
            // Connected to child successfully

            setSuccess(`Successfully connected to ${result.connection.patient.firstName} ${result.connection.patient.lastName}`);

            // Call onSuccess after a short delay to show the success message
            setTimeout(() => {
                onSuccess();
            }, 1500);

        } catch (error) {
            console.error("Error connecting to child:", error);
            setError(error instanceof Error ? error.message : "Failed to connect to child");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Connection Successful!</h3>
                <p className="text-green-700">{success}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium">Connect to Your Child&apos;s Account</p>
                    <p className="text-blue-700">Enter your child&apos;s Patient ID to connect to their therapy account.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="patientId">Patient ID *</Label>
                    <Input
                        id="patientId"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        placeholder="Enter your child's Patient ID"
                        required
                        className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                        Ask your child to share their Patient ID from their dashboard
                    </p>
                </div>

                <div>
                    <Label htmlFor="relationship">Your Relationship to Child *</Label>
                    <Select value={formData.relationship} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your relationship" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="stepmother">Stepmother</SelectItem>
                            <SelectItem value="stepfather">Stepfather</SelectItem>
                            <SelectItem value="grandmother">Grandmother</SelectItem>
                            <SelectItem value="grandfather">Grandfather</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isPrimary"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleInputChange}
                        className="rounded"
                    />
                    <Label htmlFor="isPrimary" className="text-sm">
                        I am the primary guardian for this child
                    </Label>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Important Note</p>
                        <p>
                            Only connect to accounts of children you are legally responsible for.
                            The child must provide their consent and their Patient ID for you to connect.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                    type="submit"
                    disabled={loading || !formData.patientId.trim() || !formData.relationship}
                    className="min-w-[120px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Connect
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
