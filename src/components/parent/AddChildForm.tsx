"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface AddChildFormProps {
    onSuccess: () => void;
}

export function AddChildForm({ onSuccess }: AddChildFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        relationship: "",
        isPrimary: false,
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        medicalHistory: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const emergencyContact = formData.emergencyContactName ? {
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone,
                relationship: formData.emergencyContactRelation
            } : null;

            const response = await fetch("/api/parent/children", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    address: formData.address || null,
                    relationship: formData.relationship,
                    isPrimary: formData.isPrimary,
                    emergencyContact,
                    medicalHistory: formData.medicalHistory || null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add child");
            }

            onSuccess();
        } catch (error) {
            console.error("Error adding child:", error);
            setError(error instanceof Error ? error.message : "Failed to add child");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
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

            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                    />
                </div>
            </div>

            {/* Relationship Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Relationship Information</h3>

                <div>
                    <Label htmlFor="relationship">Your Relationship to Child *</Label>
                    <Select value={formData.relationship} onValueChange={(value) => handleSelectChange("relationship", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
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
                    <Label htmlFor="isPrimary">I am the primary guardian</Label>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact (Optional)</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="emergencyContactName">Contact Name</Label>
                        <Input
                            id="emergencyContactName"
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                        <Input
                            id="emergencyContactPhone"
                            name="emergencyContactPhone"
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="emergencyContactRelation">Relationship to Child</Label>
                    <Input
                        id="emergencyContactRelation"
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={handleInputChange}
                        placeholder="e.g., Aunt, Family Friend"
                    />
                </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical History (Optional)</h3>

                <div>
                    <Label htmlFor="medicalHistory">Medical History & Notes</Label>
                    <Textarea
                        id="medicalHistory"
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any relevant medical history, allergies, medications, or special needs..."
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        "Add Child"
                    )}
                </Button>
            </div>
        </form>
    );
}
