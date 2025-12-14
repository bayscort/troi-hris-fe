import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FundRequest, FundRequestCreate, FundRequestItemCreate } from '../../types/fund-request';
import { FinanceItem } from '../../types/finance-item';
import { fundRequestService } from '../../services/api';
import { AlertTriangle, CheckCircle, Loader, X, Plus, Trash, Calculator } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  fundRequest?: FundRequest;
  financeItems: FinanceItem[];
}

const formatRupiah = (value: number) => {
  if (!value) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const FundRequestForm: React.FC<Props> = ({ isOpen, onClose, onSave, fundRequest, financeItems }) => {
  const isEdit = !!fundRequest?.id;
  const defaultFinanceItemId = financeItems[0]?.id ?? 0;

  const [formData, setFormData] = useState<FundRequestCreate>({
    fundRequestCode: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    totalAmountInWords: '',
    fundRequestApprovalLogList: [],
    fundRequestItemList: [{
      financeItemId: defaultFinanceItemId,
      description: '',
      amount: 0,
      bankAccountNumber: ''
    }]
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FundRequestCreate, string>>>({});
  const [itemErrors, setItemErrors] = useState<Partial<Record<keyof FundRequestItemCreate, string>>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && fundRequest) {
      setFormData({
        id: fundRequest.id,
        fundRequestCode: fundRequest.fundRequestCode,
        date: fundRequest.date,
        totalAmount: fundRequest.totalAmount,
        totalAmountInWords: fundRequest.totalAmountInWords,
        fundRequestApprovalLogList: fundRequest.fundRequestApprovalLogList,
        fundRequestItemList: fundRequest.fundRequestItemList.map(item => ({
          id: item.id,
          financeItemId: item.financeItem.id ?? defaultFinanceItemId,
          description: item.description,
          amount: item.amount,
          bankAccountNumber: item.bankAccountNumber
        }))
      });
      setItemErrors(fundRequest.fundRequestItemList.map(() => ({})));
    }
  }, [fundRequest, financeItems, isEdit, defaultFinanceItemId]);

  useEffect(() => {
    const total = formData.fundRequestItemList.reduce((sum, item) => sum + (item.amount || 0), 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.fundRequestItemList]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      let finalValue: string | number = value;

      if (name === 'amount') {
        const sanitizedValue = value.replace(/\D/g, '');
        finalValue = parseInt(sanitizedValue, 10) || 0;
      }
      
      setFormData(prev => ({
        ...prev,
        fundRequestItemList: prev.fundRequestItemList.map((item, i) =>
          i === index ? { ...item, [name]: finalValue } : item
        )
      }));
      setItemErrors(prev => prev.map((err, i) => i === index ? { ...err, [name]: undefined } : err));

    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'totalAmount' ? parseFloat(value) : value
      }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) setError(null);
    if (success) setSuccess(null);
  };


  const handleFinanceItemChange = (
    selected: { value: number; label: string } | null,
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      fundRequestItemList: prev.fundRequestItemList.map((item, i) =>
        i === index ? { ...item, financeItemId: selected?.value ?? 0 } : item
      )
    }));
    setItemErrors(prev => prev.map((err, i) =>
      i === index ? { ...err, financeItemId: undefined } : err
    ));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      fundRequestItemList: [
        ...prev.fundRequestItemList,
        {
          financeItemId: defaultFinanceItemId,
          description: '',
          amount: 0,
          bankAccountNumber: ''
        }
      ]
    }));
    setItemErrors(prev => [...prev, {}]);
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fundRequestItemList: prev.fundRequestItemList.filter((_, i) => i !== index)
    }));
    setItemErrors(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Partial<Record<keyof FundRequestCreate, string>> = {};
    const newItemErrors: Partial<Record<keyof FundRequestItemCreate, string>>[] =
      formData.fundRequestItemList.map(() => ({}));

    if (!formData.date) errs.date = 'Date is required';

    formData.fundRequestItemList.forEach((item, index) => {
      if (!item.financeItemId) newItemErrors[index].financeItemId = 'Finance item is required';
      if (item.amount <= 0) newItemErrors[index].amount = 'Amount must be greater than 0';
      if (!item.bankAccountNumber.trim()) newItemErrors[index].bankAccountNumber = 'Bank account number is required';
    });

    setErrors(errs);
    setItemErrors(newItemErrors);
    return Object.keys(errs).length === 0 && newItemErrors.every(err => Object.keys(err).length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEdit && fundRequest?.id) {
        await fundRequestService.updateFundRequest(fundRequest.id, formData);
        setSuccess('Fund request updated successfully');
      } else {
        await fundRequestService.createFundRequest(formData);
        setSuccess('Fund request created successfully');
      }
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch {
      setError(`Failed to ${isEdit ? 'update' : 'create'} fund request.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Fund Request' : 'Add Fund Request'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 text-sm space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex gap-2">
              <AlertTriangle size={16} /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 flex gap-2">
              <CheckCircle size={16} /> <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 mb-4">
              <div className="flex items-center gap-2 font-medium">
                <Calculator size={16} className="text-gray-500" />
                Total Amount
              </div>
              <span className="font-semibold text-base text-gray-900">
                Rp {formatRupiah(formData.totalAmount) || '0'}
              </span>
            </div>

            <label className="block font-medium mb-1">Items *</label>
            {formData.fundRequestItemList.map((item, index) => (
              <div key={index} className="border rounded-md p-4 mb-4 relative">
                {formData.fundRequestItemList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Finance Item *</label>
                    <Select
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, maxHeight: 200, overflowY: 'auto' })
                      }}
                      options={financeItems.map(fi => ({
                        value: fi.id ?? 0,
                        label: fi.name
                      }))}
                      value={financeItems
                        .map(fi => ({ value: fi.id ?? 0, label: fi.name }))
                        .find(option => option.value === item.financeItemId) || null
                      }
                      onChange={(selected) => handleFinanceItemChange(selected, index)}

                      classNamePrefix="react-select"
                    />
                    {itemErrors[index]?.financeItemId && <p className="text-red-500 mt-1">{itemErrors[index].financeItemId}</p>}
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleChange(e, index)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${itemErrors[index]?.description ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {itemErrors[index]?.description && <p className="text-red-500 mt-1">{itemErrors[index].description}</p>}
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Amount *</label>
                    <input
                      type="text" 
                      name="amount"
                      placeholder='0'
                      value={formatRupiah(item.amount)}
                      onChange={(e) => handleChange(e, index)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black text-right ${itemErrors[index]?.amount ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {itemErrors[index]?.amount && <p className="text-red-500 mt-1">{itemErrors[index].amount}</p>}
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={item.bankAccountNumber}
                      onChange={(e) => handleChange(e, index)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${itemErrors[index]?.bankAccountNumber ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {itemErrors[index]?.bankAccountNumber && <p className="text-red-500 mt-1">{itemErrors[index].bankAccountNumber}</p>}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Fund Request' : 'Create Fund Request'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundRequestForm;