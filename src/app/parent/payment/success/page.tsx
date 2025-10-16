"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface PaymentDetails {
  orderId: string;
  paymentId: string | null;
  amount: string;
  currency: string;
  status: string;
  statusMessage: string | null;
  session: {
    id: string;
    scheduledAt: string;
    therapist: {
      name: string;
    };
  } | null;
}

// Search params handler component (must be wrapped in Suspense)
function SearchParamsHandler({ children }: { children: (orderId: string | null) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  return <>{children(orderId)}</>;
}

// Main payment success content component
function PaymentSuccessContent({ orderId }: { orderId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        // Poll for payment status (webhook might take a moment)
        let attempts = 0;
        const maxAttempts = 10;

        const pollPaymentStatus = async (): Promise<boolean> => {
          const response = await fetch(`/api/parent/payment/status?orderId=${orderId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch payment details");
          }

          const data = await response.json();
          setPaymentDetails(data);

          // If payment is completed and session is created, stop polling
          if (data.status === "COMPLETED" && data.session) {
            return true;
          }

          // If payment failed or cancelled, stop polling
          if (data.status === "FAILED" || data.status === "CANCELLED") {
            return true;
          }

          return false;
        };

        // Initial fetch
        const isDone = await pollPaymentStatus();

        // If not done, poll every 2 seconds
        if (!isDone && attempts < maxAttempts) {
          const interval = setInterval(async () => {
            attempts++;
            const isDone = await pollPaymentStatus();

            if (isDone || attempts >= maxAttempts) {
              clearInterval(interval);
              setLoading(false);
            }
          }, 2000);

          // Cleanup
          setTimeout(() => {
            clearInterval(interval);
            setLoading(false);
          }, maxAttempts * 2000);
        } else {
          setLoading(false);
        }

      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError(err instanceof Error ? err.message : "Failed to load payment details");
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  const handleDone = () => {
    router.push("/parent/appointments");
  };

  const handleRetry = () => {
    router.push("/parent/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your payment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = paymentDetails?.status === "COMPLETED";
  const isFailed = paymentDetails?.status === "FAILED" || paymentDetails?.status === "CANCELLED";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          {isSuccess && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl text-destructive">Payment Failed</CardTitle>
            </>
          )}
          {!isSuccess && !isFailed && (
            <>
              <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-yellow-600">Payment Pending</CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono font-medium">{paymentDetails?.orderId}</span>
            </div>

            {paymentDetails?.paymentId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono font-medium">{paymentDetails.paymentId}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">
                {paymentDetails?.currency} {paymentDetails?.amount}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-semibold ${
                isSuccess ? "text-green-600" :
                isFailed ? "text-destructive" :
                "text-yellow-600"
              }`}>
                {paymentDetails?.status}
              </span>
            </div>

            {paymentDetails?.statusMessage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Message:</span>
                <span className="font-medium">{paymentDetails.statusMessage}</span>
              </div>
            )}
          </div>

          {/* Session Details (if available) */}
          {paymentDetails?.session && (
            <div className="bg-primary/5 rounded-lg p-6 space-y-3 border border-primary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Session Booked Successfully
              </h3>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Session ID:</span>
                <span className="font-mono font-medium">{paymentDetails.session.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapist:</span>
                <span className="font-medium">Dr. {paymentDetails.session.therapist.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-medium">
                  {new Date(paymentDetails.session.scheduledAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && paymentDetails?.session && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-center">
                Your therapy session has been successfully booked! You can view and manage your appointments in the Appointments section.
              </p>
            </div>
          )}

          {/* Pending Message */}
          {!isSuccess && !isFailed && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-center">
                Your payment is being processed. This may take a few moments. Please check your appointments page shortly.
              </p>
            </div>
          )}

          {/* Failed Message */}
          {isFailed && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-center">
                {paymentDetails?.statusMessage || "Payment was not completed. Please try again."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isSuccess ? (
              <Button onClick={handleDone} className="w-full" size="lg">
                Done - View Appointments
              </Button>
            ) : (
              <>
                <Button onClick={handleRetry} variant="outline" className="flex-1" size="lg">
                  Return to Dashboard
                </Button>
                {isFailed && (
                  <Button onClick={handleRetry} className="flex-1" size="lg">
                    Try Again
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export wrapper with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading payment details...</h2>
        </div>
      </div>
    }>
      <SearchParamsHandler>
        {(orderId) => <PaymentSuccessContent orderId={orderId} />}
      </SearchParamsHandler>
    </Suspense>
  );
}
