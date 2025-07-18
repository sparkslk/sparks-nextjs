"use client";

import { useState, useEffect } from "react";
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

    // Prefill emergency contact fields with parent's info if empty (only once per field)
    const prefilledFields = {
        name: useRef(false),
        phone: useRef(false),
        relation: useRef(false),
    };

    useEffect(() => {
        setFormData(prev => {
            let changed = false;
            const updated = { ...prev };
            if (!prefilledFields.name.current && !updated.emergencyContactName && updated.firstName) {
                updated.emergencyContactName = updated.firstName;
                prefilledFields.name.current = true;
                changed = true;
            }
            if (!prefilledFields.phone.current && !updated.emergencyContactPhone && updated.phone) {
                updated.emergencyContactPhone = updated.phone;
                prefilledFields.phone.current = true;
                changed = true;
            }
            if (!prefilledFields.relation.current && !updated.emergencyContactRelation && updated.relationship) {
                updated.emergencyContactRelation = updated.relationship.charAt(0).toUpperCase() + updated.relationship.slice(1);
                prefilledFields.relation.current = true;
                changed = true;
            }
            return changed ? updated : prev;
        });
    }, [formData.firstName, formData.phone, formData.relationship]);

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
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-2">
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
            <Card className="shadow-sm border bg-card">
                <CardContent className="py-6 px-4 md:px-8">
                    <h3 className="text-lg font-semibold mb-6 text-primary">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="firstName" className="mb-1 block">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName" className="mb-1 block">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dateOfBirth" className="mb-1 block">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="gender" className="mb-1 block">Gender *</Label>
                            <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                                <SelectTrigger className="w-full">
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
                        <div>
                            <Label htmlFor="phone" className="mb-1 block">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="mb-1 block">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="address" className="mb-1 block">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Relationship Information */}
            <Card className="shadow-sm border bg-card">
                <CardContent className="py-6 px-4 md:px-8">
                    <h3 className="text-lg font-semibold mb-6 text-primary">Relationship Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <Label htmlFor="relationship" className="mb-1 block">Your Relationship to Child *</Label>
                            <Select value={formData.relationship} onValueChange={(value) => handleSelectChange("relationship", value)}>
                                <SelectTrigger className="w-full">
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
                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                            <input
                                type="checkbox"
                                id="isPrimary"
                                name="isPrimary"
                                checked={formData.isPrimary}
                                onChange={handleInputChange}
                                className="rounded border border-border h-5 w-5 accent-primary"
                            />
                            <Label htmlFor="isPrimary" className="mb-0">I am the primary guardian</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="shadow-sm border bg-card">
                <CardContent className="py-6 px-4 md:px-8">
                    <h3 className="text-lg font-semibold mb-6 text-primary">Emergency Contact <span className="text-muted-foreground text-sm">(Optional)</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="emergencyContactName" className="mb-1 block">Contact Name</Label>
                            <Input
                                id="emergencyContactName"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="emergencyContactPhone" className="mb-1 block">Contact Phone</Label>
                            <Input
                                id="emergencyContactPhone"
                                name="emergencyContactPhone"
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="emergencyContactRelation" className="mb-1 block">Relationship to Child</Label>
                            <Input
                                id="emergencyContactRelation"
                                name="emergencyContactRelation"
                                value={formData.emergencyContactRelation}
                                onChange={handleInputChange}
                                placeholder="e.g., Aunt, Family Friend"
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Medical History */}
            <Card className="shadow-sm border bg-card">
                <CardContent className="py-6 px-4 md:px-8">
                    <h3 className="text-lg font-semibold mb-6 text-primary">Medical History <span className="text-muted-foreground text-sm">(Optional)</span></h3>
                    <div>
                        <Label htmlFor="medicalHistory" className="mb-1 block">Medical History & Notes</Label>
                        <Textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Any relevant medical history, allergies, medications, or special needs..."
                            className="w-full"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[140px] h-11 text-base font-semibold shadow-md"
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
