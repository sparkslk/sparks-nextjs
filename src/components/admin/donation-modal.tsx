import React from "react";
import { Check, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Donation {
  id: string;
  name: string;
  amount: number;
  timeAgo: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donations: Donation[];
}

const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  donations,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{
          padding: 0,
          overflow: "hidden",
          borderRadius: "0.75rem",
          maxWidth: "36rem",
          width: "100%",
        }}
        className="shadow-2xl"
      >
        <div
          style={{
            background: "#8159A8",
            color: "white",
            borderTopLeftRadius: "0.75rem",
            borderTopRightRadius: "0.75rem",
            padding: "1.5rem 2rem 1.25rem 2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Gift className="h-5 w-5" />
          <DialogTitle
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "1.25rem",
              margin: 0,
            }}
          >
            All Donations
          </DialogTitle>
        </div>
        <div
          style={{
            padding: "2rem",
            background: "white",
            borderBottomLeftRadius: "0.75rem",
            borderBottomRightRadius: "0.75rem",
          }}
        >
          <h3 className="text-gray-800 font-medium mb-4">Recent Donations</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {donations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No donations found
              </p>
            ) : (
              donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-start justify-between py-2"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {donation.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Received: {donation.timeAgo}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#8159A8]">
                      Rs. {donation.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                      <Check size={12} />
                      <span>VERIFIED</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { DonationModal };
