import React, { useState, useEffect, useRef } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { accountService, reconciliationService } from '../services/api';
import { AccountResp } from '../types/account';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';
import { ArrowLeftRight, Calendar, CheckCircle2, GitMerge, Info, Undo2, Zap, XCircle } from 'lucide-react';
import { ManualReconciliationPayload } from '../types/reconciliation';

interface BankStatement {
    id: number;
    postDate: string;
    remarks: string;
    debitAmount: number;
    creditAmount: number;
}
interface InternalTransaction {
    id: number;
    type: 'RECEIPT' | 'EXPENDITURE';
    date: string;
    description: string;
    amount: number;
}
interface ReconciliationItem {
    id?: number;
    status: 'RECONCILED' | 'UNRECONCILED_INTERNAL' | 'UNRECONCILED_BANK';
    bankStatement?: BankStatement;
    internalTransaction?: InternalTransaction;
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
const getItemDate = (item: ReconciliationItem): string => {
    return item.bankStatement?.postDate || item.internalTransaction?.date || '';
};
const getBankType = (bankStatement?: BankStatement): string => {
    if (!bankStatement) return '';
    return bankStatement.debitAmount === 0 ? 'CR' : bankStatement.creditAmount === 0 ? 'DB' : '';
};
const getBankAmount = (bankStatement?: BankStatement): number => {
    if (!bankStatement) return 0;
    return bankStatement.debitAmount || bankStatement.creditAmount;
};
const getInternalType = (internalTransaction?: InternalTransaction): string => {
    if (!internalTransaction) return '';
    return internalTransaction.type === 'RECEIPT' ? 'CR' : internalTransaction.type === 'EXPENDITURE' ? 'DB' : '';
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
    </div>
);

const InfoBlock: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <div className="text-center bg-white border border-slate-200 rounded-lg p-12 mt-6">
        <Info className="mx-auto h-10 w-10 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-1">{message}</p>
    </div>
);

const StatusBadge: React.FC<{ status: 'RECONCILED' | 'UNRECONCILED' }> = ({ status }) => {
    const isReconciled = status === 'RECONCILED';
    const bgColor = isReconciled ? 'bg-green-100' : 'bg-red-100';
    const textColor = isReconciled ? 'text-green-700' : 'text-red-700';
    const Icon = isReconciled ? CheckCircle2 : XCircle;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${bgColor} ${textColor}`}>
            <Icon size={14} />
            {isReconciled ? 'Matched' : 'Unmatched'}
        </span>
    );
};

interface ControlsProps {
    accounts: AccountResp[];
    selectedAccount: number | null;
    onAccountChange: (id: number | null) => void;
    dateRange: { startDate?: Date; endDate?: Date; key: 'selection' };
    onDateChange: (ranges: RangeKeyDict) => void;
    onReset: () => void;
    onAutoReconcile: () => void;
    isAutoReconcileDisabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ accounts, selectedAccount, onAccountChange, dateRange, onDateChange, onReset, onAutoReconcile, isAutoReconcileDisabled }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setIsPickerOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDateRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) return 'Pilih Periode Tanggal';
        return `${format(dateRange.startDate, 'd MMM', { locale: id })} - ${format(dateRange.endDate, 'd MMM yyyy', { locale: id })}`;
    };

    return (
        <div className="flex flex-wrap gap-3 items-center mb-6">
            <select
                className="w-full sm:w-auto text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition px-3 py-2"
                value={selectedAccount ?? ''}
                onChange={(e) => onAccountChange(e.target.value ? Number(e.target.value) : null)}
            >
                <option value="">Pilih Akun Bank</option>
                {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                        {acc.name}
                    </option>
                ))}
            </select>
            <div className="relative" ref={pickerRef}>
                <button
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                >
                    <Calendar size={16} /> {formatDateRange()}
                </button>
                {isPickerOpen && (
                    <div className="absolute z-20 mt-2 bg-white shadow-lg rounded-lg border border-slate-200">
                        <DateRangePicker
                            ranges={[{ startDate: dateRange.startDate ?? new Date(), endDate: dateRange.endDate ?? new Date(), key: 'selection' }]}
                            onChange={onDateChange}
                            maxDate={new Date()}
                            showDateDisplay={false}
                            rangeColors={['#f97316']}
                            locale={id}
                        />
                    </div>
                )}
            </div>
            <button
                onClick={onReset}
                className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-100 bg-white transition-colors"
            >
                Reset
            </button>
            <div className="flex-grow"></div>
            <button
                onClick={onAutoReconcile}
                disabled={isAutoReconcileDisabled}
                className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Zap size={16} />
                Auto Reconcile
            </button>
        </div>
    );
};


const ReconciliationPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountResp[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [reconciliationData, setReconciliationData] = useState<ReconciliationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date; key: 'selection' }>({
        startDate: undefined,
        endDate: undefined,
        key: 'selection',
    });
    const [selectedBankItem, setSelectedBankItem] = useState<BankStatement | null>(null);
    const [selectedInternalItem, setSelectedInternalItem] = useState<InternalTransaction | null>(null);
    const [selectedToUnreconcile, setSelectedToUnreconcile] = useState<Set<number>>(new Set());

    useEffect(() => {
        accountService.getAllAccounts().then(setAccounts);
    }, []);

    const loadReconciliationData = async () => {
        if (!selectedAccount || !dateRange.startDate || !dateRange.endDate) return;
        setLoading(true);
        setReconciliationData([]);
        setSelectedBankItem(null);
        setSelectedInternalItem(null);
        setSelectedToUnreconcile(new Set());
        try {
            const data = await reconciliationService.getAll(selectedAccount, dateRange.startDate, dateRange.endDate);
            data.sort((a: ReconciliationItem, b: ReconciliationItem) => {
                const dateA = new Date(getItemDate(a));
                const dateB = new Date(getItemDate(b));
                return dateA.getTime() - dateB.getTime();
            });
            setReconciliationData(data);
        } catch (err) {
            console.error('Failed to load reconciliation data:', err);
            toast.error('Gagal memuat data rekonsiliasi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAccount && dateRange.startDate && dateRange.endDate) {
            loadReconciliationData();
        }
    }, [selectedAccount, dateRange]);

    const handleDateChange = (ranges: RangeKeyDict) => {
        const { selection } = ranges;
        setDateRange({ startDate: selection.startDate, endDate: selection.endDate, key: 'selection' });
    };

    const handleReset = () => {
        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setSelectedAccount(null);
        setReconciliationData([]);
        setSelectedToUnreconcile(new Set());
    };

    const handleUnreconcileSelect = (reconciliationId: number) => {
        setSelectedToUnreconcile(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(reconciliationId)) {
                newSelected.delete(reconciliationId);
            } else {
                newSelected.add(reconciliationId);
            }
            return newSelected;
        });
        setSelectedBankItem(null);
        setSelectedInternalItem(null);
    };

    const handleRowClick = (item: ReconciliationItem) => {
        if (item.status === 'RECONCILED') {
            if (item.id) handleUnreconcileSelect(item.id);
            return;
        }

        setSelectedToUnreconcile(new Set());

        if (item.status === 'UNRECONCILED_BANK' && item.bankStatement) {
            setSelectedBankItem(selectedBankItem?.id === item.bankStatement.id ? null : item.bankStatement);
        } else if (item.status === 'UNRECONCILED_INTERNAL' && item.internalTransaction) {
            setSelectedInternalItem(selectedInternalItem?.id === item.internalTransaction.id ? null : item.internalTransaction);
        }
    };

    const handleManualReconcile = async () => {
        if (!selectedBankItem || !selectedInternalItem) return;
        const payload: ManualReconciliationPayload = { bankStatementId: selectedBankItem.id };
        if (selectedInternalItem.type === 'RECEIPT') payload.receiptId = selectedInternalItem.id;
        else payload.expenditureId = selectedInternalItem.id;

        try {
            await reconciliationService.manualReconcile(payload);
            toast.success('Rekonsiliasi manual berhasil!', { duration: 1000, dismissible: true });
            await loadReconciliationData();
        } catch (error) {
            console.error('Manual reconciliation failed:', error);
            toast.error('Rekonsiliasi manual gagal.', { duration: 1000, dismissible: true });
        }
    };

    const handleAutoReconcile = async () => {
        if (!selectedAccount || !dateRange.startDate || !dateRange.endDate) return;
        setLoading(true);
        try {
            await reconciliationService.autoReconcile(selectedAccount, dateRange.startDate, dateRange.endDate);
            toast.success('Rekonsiliasi otomatis berhasil dijalankan!', { duration: 1000, dismissible: true });
            await loadReconciliationData();
        } catch (error) {
            console.error('Auto reconciliation failed:', error);
            toast.error('Rekonsiliasi otomatis gagal.', { duration: 1000, dismissible: true });
        } finally {
            setLoading(false);
        }
    };

    const handleUnreconcile = async () => {
        if (selectedToUnreconcile.size === 0) return;

        try {
            const unreconcilePromises = Array.from(selectedToUnreconcile).map(id => reconciliationService.unreconcile(id));
            await Promise.all(unreconcilePromises);
            toast.success(`${selectedToUnreconcile.size} item berhasil di-unreconcile.`, { duration: 1000, dismissible: true });
            await loadReconciliationData();
        } catch (error) {
            console.error('Unreconciliation failed:', error);
            toast.error('Gagal membatalkan rekonsiliasi.', { duration: 1000, dismissible: true });
        }
    };

    const renderContent = () => {
        if (loading) return <Spinner />;
        if (!selectedAccount) return <InfoBlock title="Mulai Rekonsiliasi" message="Pilih akun bank untuk memulai." />;
        if (!dateRange.startDate || !dateRange.endDate) return <InfoBlock title="Pilih Periode" message="Pilih rentang tanggal untuk menampilkan data." />;
        if (reconciliationData.length === 0) return <InfoBlock title="Tidak Ada Data" message="Tidak ada data transaksi pada periode dan akun yang dipilih." />;

        return (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Bank Date</th>
                                <th className="px-4 py-3 text-left font-medium">Bank Description</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-right font-medium">Bank Amount</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Ledger Date</th>
                                <th className="px-4 py-3 text-left font-medium">Ledger Description</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-right font-medium">Ledger Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {reconciliationData.map((item, idx) => {
                                const isReconciled = item.status === 'RECONCILED';
                                const isUnreconciledBank = item.status === 'UNRECONCILED_BANK';
                                const isUnreconciledInternal = item.status === 'UNRECONCILED_INTERNAL';

                                const isSelectedForManual =
                                    (isUnreconciledBank && selectedBankItem?.id === item.bankStatement?.id) ||
                                    (isUnreconciledInternal && selectedInternalItem?.id === item.internalTransaction?.id);

                                const isSelectedForUnreconcile =
                                    isReconciled && item.id !== undefined && selectedToUnreconcile.has(item.id);

                                const getRowClasses = () => {
                                    let baseClasses = 'border-t border-slate-200 cursor-pointer transition-all duration-150 ease-in-out';

                                    if (isSelectedForManual) {
                                        return `${baseClasses} bg-blue-100/70 border-l-4 border-l-blue-500 text-slate-800 font-medium`;
                                    }

                                    if (isSelectedForUnreconcile) {
                                        return `${baseClasses} bg-orange-100/70 border-l-4 border-l-orange-500 text-slate-800 font-medium`;
                                    }

                                    if (isReconciled) {
                                        return `${baseClasses} bg-white hover:bg-slate-50`;
                                    }
                                    if (isUnreconciledBank) {
                                        return `${baseClasses} bg-red-50/30 hover:bg-red-50/60`;
                                    }
                                    if (isUnreconciledInternal) {
                                        return `${baseClasses} bg-yellow-50/30 hover:bg-yellow-50/60`;
                                    }

                                    return `${baseClasses} bg-white hover:bg-slate-50`;
                                };

                                return (
                                    <tr
                                        key={`item-${idx}`}
                                        className={getRowClasses()}
                                        onClick={() => handleRowClick(item)}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.bankStatement
                                                ? format(new Date(item.bankStatement.postDate), 'dd MMM yyyy', { locale: id })
                                                : ''}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate" title={item.bankStatement?.remarks || ''}>
                                            {item.bankStatement?.remarks && item.bankStatement.remarks.length > 10
                                                ? `${item.bankStatement.remarks.slice(0, 10)}...`
                                                : item.bankStatement?.remarks}
                                        </td>
                                        <td className="px-4 py-3 text-left font-mono text-xs">
                                            {getBankType(item.bankStatement)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {item.bankStatement ? formatCurrency(getBankAmount(item.bankStatement)) : ''}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={isReconciled ? 'RECONCILED' : 'UNRECONCILED'} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.internalTransaction
                                                ? format(new Date(item.internalTransaction.date), 'dd MMM yyyy', { locale: id })
                                                : ''}
                                        </td>
                                        <td
                                            className="px-4 py-3 max-w-xs truncate"
                                            title={item.internalTransaction?.description || ''}
                                        >
                                            {item.internalTransaction?.description && item.internalTransaction.description.length > 10
                                                ? `${item.internalTransaction.description.slice(0, 10)}...`
                                                : item.internalTransaction?.description}
                                        </td>
                                        <td className="px-4 py-3 text-left font-mono text-xs">
                                            {getInternalType(item.internalTransaction)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {item.internalTransaction ? formatCurrency(item.internalTransaction.amount) : ''}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );

    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
            <Toaster richColors position="top-right" />
            <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <ArrowLeftRight className="text-gray-700" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">Reconciliations</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedBankItem && selectedInternalItem && (
                            <button onClick={handleManualReconcile} disabled={loading} className="flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 disabled:opacity-50">
                                <GitMerge size={16} />
                                Reconcile Selected
                            </button>
                        )}
                        {selectedToUnreconcile.size > 0 && (
                            <button onClick={handleUnreconcile} disabled={loading} className="flex items-center gap-2 rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-all shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                                <Undo2 size={16} />
                                Unreconcile ({selectedToUnreconcile.size})
                            </button>
                        )}
                    </div>
                </div>
                <Controls
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    onAccountChange={setSelectedAccount}
                    dateRange={dateRange}
                    onDateChange={handleDateChange}
                    onReset={handleReset}
                    onAutoReconcile={handleAutoReconcile}
                    isAutoReconcileDisabled={!selectedAccount || !dateRange.startDate || !dateRange.endDate || loading}
                />
                <div className="mt-6">{renderContent()}</div>
            </main>
        </div>
    );
};

export default ReconciliationPage;