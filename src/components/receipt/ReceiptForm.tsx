import React, { useEffect, useState } from "react";
import Select from "react-select";
import { accountService, financeItemService, receiptService } from "../../services/api";
import { AccountResp } from "../../types/account";
import { FinanceItem } from "../../types/finance-item";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Calculator } from "lucide-react";

interface Receipt {
  id: number;
  receiptDate: string;
  accountId: number | undefined;
  financeItemId: number | undefined;
  amount: number;
  reconciled: boolean;
  note: string;
}

interface ReceiptFormProps {
  onClose: () => void;
  onSuccess: () => void;
  receiptToEdit?: Receipt | null;
}

interface ReceiptItem {
  financeItemId: string;
  amount: string;
  isReconciled: boolean;
  note: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

// Fungsi ini sudah benar, mengubah format '1.234,56' menjadi angka 1234.56
const parseAmount = (str: string) => {
  if (typeof str !== 'string') return 0;
  const clean = str.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
};

const ReceiptForm: React.FC<ReceiptFormProps> = ({ onClose, onSuccess, receiptToEdit }) => {
  const [accounts, setAccounts] = useState<AccountResp[]>([]);
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [date, setDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([
    { financeItemId: "", amount: "", isReconciled: false, note: "" }
  ]);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!receiptToEdit;

  useEffect(() => {
    accountService.getAllAccounts().then(setAccounts);
    financeItemService.getAllFinanceItems().then(setFinanceItems);

    if (isEditMode && receiptToEdit) {
      setDate(new Date(receiptToEdit.receiptDate).toISOString().split('T')[0]);
      setAccountId(String(receiptToEdit.accountId));
      setItems([{
        financeItemId: String(receiptToEdit.financeItemId),
        // Format amount awal dari data
        amount: receiptToEdit.amount.toLocaleString('id-ID', { maximumFractionDigits: 10 }),
        isReconciled: receiptToEdit.reconciled,
        note: receiptToEdit.note
      }]);
    }

  }, [receiptToEdit, isEditMode]);

  const addItem = () => {
    setItems([...items, { financeItemId: "", amount: "", isReconciled: false, note: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | boolean) => {
    const newItems = [...items];
    newItems[index][field] = value as never;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && receiptToEdit) {
        const singleItem = items[0];
        const payload = {
          id: receiptToEdit.id,
          receiptDate: date,
          accountId: Number(accountId),
          financeItemId: Number(singleItem.financeItemId),
          amount: parseAmount(singleItem.amount),
          reconciled: singleItem.isReconciled,
          note: singleItem.note
        };
        await receiptService.updateReceipt(receiptToEdit.id, payload);
      } else {
        const payload = items.map((item) => ({
          receiptDate: date,
          accountId: Number(accountId),
          financeItemId: Number(item.financeItemId),
          amount: parseAmount(item.amount),
          reconciled: item.isReconciled,
          note: item.note
        }));
        await receiptService.createReceipts(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save receipt(s):", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + parseAmount(i.amount), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {isEditMode ? 'Edit Receipt' : 'Add New Receipts'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-200 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-gray-500" />
            Total Amount: <span className="font-medium text-gray-900">{formatRupiah(totalAmount)}</span>
          </div>
          {!isEditMode && <span>{items.length} item{items.length > 1 ? "s" : ""}</span>}
        </div>

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={isEditMode}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:shadow-sm transition"
                  >
                    <div className="flex-1">
                      <Select
                        options={financeItems.map(fi => ({
                          value: String(fi.id),
                          label: fi.name
                        }))}
                        value={
                          financeItems
                            .filter(fi => String(fi.id) === String(item.financeItemId))
                            .map(fi => ({ value: String(fi.id), label: fi.name }))[0] || null
                        }
                        onChange={(selected) => updateItem(index, "financeItemId", selected ? selected.value : "")}
                        placeholder="Select Finance Item..."
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </div>

                    <input
                      type="text"
                      className="w-40 rounded-md px-2 py-1 text-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="Note"
                      value={item.note}
                      onChange={(e) => updateItem(index, "note", e.target.value)}
                    />

                    {/* === BLOK KODE YANG DIPERBAIKI === */}
                    <input
                      type="text"
                      className="w-32 rounded-md px-2 py-1 text-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-right"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        let sanitized = value.replace(/[^0-9,]/g, '');
                        const parts = sanitized.split(',');
                        if (parts.length > 2) {
                          sanitized = `${parts[0]},${parts.slice(1).join('')}`;
                        }
                        updateItem(index, 'amount', sanitized);
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        const numValue = parseAmount(value);
                        if (!isNaN(numValue) && value) {
                          updateItem(index, 'amount', numValue.toLocaleString('id-ID', { maximumFractionDigits: 10 }));
                        }
                      }}
                      required
                    />
                    {/* === AKHIR BLOK === */}

                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 rounded-md hover:bg-gray-200 transition"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <Plus size={16} /> Add another item
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : (isEditMode ? 'Save Changes' : 'Save All')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReceiptForm;