import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface Session {
    id: string;
    scheduledAt: string;
    patientName?: string;
    therapistName?: string;
}

interface RefundInfo {
    originalAmount: number;
    refundAmount: number;
    refundPercentage: number;
    hoursBeforeSession: string;
    canRefund: boolean;
    refundPolicy: {
        before24Hours: string;
        within24Hours: string;
        afterSession: string;
    };
}

interface BankDetails {
    bankAccountName: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode: string;
}

interface SessionCancellationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    onSessionCancelled?: () => void;
}

export default function SessionCancellationDialog({
    isOpen,
    onClose,
    session,
    onSessionCancelled
}: SessionCancellationDialogProps) {
    const [step, setStep] = useState<'calculate' | 'details' | 'confirm'>('calculate');
    const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [bankDetails, setBankDetails] = useState<BankDetails>({
        bankAccountName: '',
        bankName: '',
        accountNumber: '',
        branchCode: '',
        swiftCode: ''
    });
    const [error, setError] = useState<string | null>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        const fetchRefundInfo = async () => {
            if (!session) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/parent/sessions/calculate-refund', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: session.id,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setRefundInfo(data.refund);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to calculate refund');
                }
            } catch (error) {
                console.error('Error fetching refund info:', error);
                setError('An error occurred while calculating refund');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && session) {
            setStep('calculate');
            setRefundInfo(null);
            setError(null);
            setCancelReason('');
            setBankDetails({
                bankAccountName: '',
                bankName: '',
                accountNumber: '',
                branchCode: '',
                swiftCode: ''
            });
            fetchRefundInfo();
        }
    }, [isOpen, session]);

    const handleNext = () => {
        if (step === 'calculate') {
            if (refundInfo?.canRefund) {
                setStep('details');
            } else {
                setStep('confirm');
            }
        } else if (step === 'details') {
            setStep('confirm');
        }
    };

    const handleBack = () => {
        if (step === 'details') {
            setStep('calculate');
        } else if (step === 'confirm') {
            if (refundInfo?.canRefund) {
                setStep('details');
            } else {
                setStep('calculate');
            }
        }
    };

    const handleCancel = async () => {
        if (!session) return;

        setCancelling(true);
        setError(null);

        try {
            const response = await fetch('/api/parent/sessions/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: session.id,
                    cancelReason: cancelReason.trim() || undefined,
                    bankDetails: refundInfo?.canRefund ? bankDetails : undefined,
                }),
            });

            if (response.ok) {
                onSessionCancelled?.();
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to cancel session');
            }
        } catch (error) {
            console.error('Error cancelling session:', error);
            setError('An error occurred while cancelling the session');
        } finally {
            setCancelling(false);
        }
    };

    const isNextDisabled = () => {
        if (step === 'details' && refundInfo?.canRefund) {
            return !bankDetails.bankAccountName || !bankDetails.bankName || !bankDetails.accountNumber;
        }
        return false;
    };

    const isCancelDisabled = () => {
        return cancelling || (step === 'details' && isNextDisabled());
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cancel Session
                    </DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Step 1: Calculate Refund */}
                {step === 'calculate' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Session Cancellation</h3>
                            <p className="text-muted-foreground">
                                {session?.scheduledAt && `Session scheduled for ${new Date(session.scheduledAt).toLocaleString()}`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 animate-spin" />
                                    <span>Calculating refund amount...</span>
                                </div>
                            </div>
                        ) : refundInfo ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Refund Calculation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Original Amount</Label>
                                            <p className="text-2xl font-bold text-primary">Rs. {refundInfo.originalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Refund Amount</Label>
                                            <p className="text-2xl font-bold text-green-600">Rs. {refundInfo.refundAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Refund Details</Label>
                                        <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                                            <p><strong>Refund Percentage:</strong> {refundInfo.refundPercentage}%</p>
                                            <p><strong>Hours Before Session:</strong> {refundInfo.hoursBeforeSession}</p>
                                            {refundInfo.canRefund ? (
                                                <p className="text-green-600 font-medium">✓ Refund available</p>
                                            ) : (
                                                <p className="text-red-600 font-medium">✗ No refund available</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Refund Policy</Label>
                                        <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-1">
                                            <p><strong>24+ hours before:</strong> {refundInfo.refundPolicy.before24Hours}</p>
                                            <p><strong>Within 24 hours:</strong> {refundInfo.refundPolicy.within24Hours}</p>
                                            {/* <p><strong>After session time:</strong> {refundInfo.refundPolicy.afterSession}</p> */}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="cancelReason">Reason for Cancellation (Optional)</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please let us know why you're cancelling this session..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Bank Details (only if refund is available) */}
                {step === 'details' && refundInfo?.canRefund && (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <h3 className="text-xl font-semibold text-primary flex items-center justify-center gap-3">
                                <CreditCard className="h-6 w-6" />
                                Bank Details for Refund
                            </h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">
                                    Refund Amount: Rs. {refundInfo.refundAmount.toFixed(2)}
                                </p>
                                <p className="text-green-700 text-sm mt-1">
                                    This amount will be processed to your bank account within 3-5 business days
                                </p>
                            </div>
                        </div>

                        <Card className="border-2 border-primary/20">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="text-lg text-primary">Bank Account Information</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Please provide accurate bank details to ensure successful refund processing
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankAccountName" className="text-base font-medium">
                                            Account Holder Name *
                                        </Label>
                                        <Input
                                            id="bankAccountName"
                                            value={bankDetails.bankAccountName}
                                            onChange={(e) => setBankDetails(prev => ({ ...prev, bankAccountName: e.target.value }))}
                                            placeholder="Full name as per bank account"
                                            className="h-12 text-base"
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Enter the exact name on your bank account
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName" className="text-base font-medium">
                                            Bank Name *
                                        </Label>
                                        <Input
                                            id="bankName"
                                            value={bankDetails.bankName}
                                            onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                                            placeholder="e.g., Commercial Bank of Ceylon"
                                            className="h-12 text-base"
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Full name of your bank
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber" className="text-base font-medium">
                                        Account Number *
                                    </Label>
                                    <Input
                                        id="accountNumber"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                                        placeholder="Your bank account number"
                                        className="h-12 text-base font-mono"
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Enter your complete bank account number
                                    </p>
                                </div>

                                <Separator />

                                <Alert className="border-blue-200 bg-blue-50">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <strong>Refund Processing:</strong> Your refund will be processed within 3-5 business days after approval.
                                        You will receive a confirmation email once the refund has been initiated.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 'confirm' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Confirm Cancellation</h3>
                            <p className="text-muted-foreground">
                                Are you sure you want to cancel this session?
                            </p>
                        </div>

                        {refundInfo && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Original Amount:</span>
                                            <span className="font-medium">Rs. {refundInfo.originalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Refund Amount:</span>
                                            <span className="font-medium text-green-600">Rs. {refundInfo.refundAmount.toFixed(2)}</span>
                                        </div>
                                        {refundInfo.canRefund && (
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>Refund Method:</span>
                                                <span>Bank Transfer to {bankDetails.bankName}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {cancelReason && (
                            <div>
                                <Label className="text-sm font-medium">Cancellation Reason:</Label>
                                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">{cancelReason}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                    <div>
                        {step !== 'calculate' && (
                            <Button variant="outline" onClick={handleBack} disabled={cancelling}>
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={cancelling}>
                            Keep Session
                        </Button>

                        {step === 'confirm' ? (
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={isCancelDisabled()}
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Session'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={isNextDisabled()}
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}