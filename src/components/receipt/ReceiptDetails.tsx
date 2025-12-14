import React from "react";
import { ReceiptDTO } from "../../types/receipt";
import { X } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ReceiptDetailsProps {
  receipt: ReceiptDTO;
  onClose: () => void;
}

const formatNumber = (amount: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount || 0);

const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ receipt, onClose }) => {
  const amount = receipt.amount ?? 0;
  const formatted = formatNumber(amount);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-3xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Receipt details"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">

          <div className="flex items-center gap-2">

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center">
                <div className="w-full flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Amount</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm text-gray-600 font-medium">Rp</span>
                      <div className="text-3xl md:text-4xl font-extrabold text-gray-900 font-mono tracking-tight">
                        {formatted}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 w-full text-center text-xs text-gray-500">
                  <div>{receipt.financeItem?.name || "-"}</div>
                </div>
              </div>
            </div>

            <div className="md:flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Finance Item" value={receipt.financeItem?.name || "-"} />
                <DetailRow label="Account" value={receipt.account?.name || "-"} />
                <DetailRow label="Date" value={format(new Date(receipt.receiptDate), "dd MMM yyyy")} />
                <DetailRow label="Status" value={receipt.note ||  ""} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-900 font-medium mt-1">{value}</span>
  </div>
);

export default ReceiptDetails;
