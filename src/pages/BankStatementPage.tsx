import React, { useState, useEffect, useRef } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { accountService, bankStatementService } from '../services/api';
import { AccountResp } from '../types/account';
import { BankStatementDTO } from '../types/bank-statement';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FiDatabase } from 'react-icons/fi';
import { Calendar, ScrollText, Upload } from 'lucide-react';
import { Toaster, toast } from 'sonner';


const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
);

const InfoBlock: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <div className="text-center bg-white border border-gray-200 rounded-lg p-10 mt-6">
        <FiDatabase className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 mt-1">{message}</p>
    </div>
);

interface ControlsProps {
    accounts: AccountResp[];
    selectedAccount: number | null;
    onAccountChange: (id: number | null) => void;
    dateRange: { startDate?: Date; endDate?: Date; key: 'selection' };
    onDateChange: (ranges: RangeKeyDict) => void;
    onPreset: (days: number) => void;
    onReset: () => void;
    activePreset: string | null;
}

const Controls: React.FC<ControlsProps> = ({
    accounts,
    selectedAccount,
    onAccountChange,
    dateRange,
    onDateChange,
    onPreset,
    onReset,
    activePreset
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDateRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) return 'Semua Tanggal';
        return `Dari ${format(dateRange.startDate, 'd MMM yyyy', { locale: id })} - ${format(dateRange.endDate, 'd MMM yyyy', { locale: id })}`;
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Filter Akun
                </label>
                <select
                    className="text-sm border border-gray-200 rounded-lg shadow-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    value={selectedAccount ?? ""}
                    onChange={(e) => onAccountChange(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">Pilih Bank Account</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative" ref={pickerRef}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="flex items-center gap-2 bg-[#ff6908] text-white px-3 py-1.5 rounded-md hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff8533] text-sm"
                    >
                        <Calendar size={16} /> {formatDateRange()}
                    </button>
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => onPreset(7)}
                            className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === '7' ? 'bg-orange-100 text-[#ff6908] border-[#ff6908]' : 'text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]'}`}
                        >
                            7 Hari
                        </button>
                        <button
                            onClick={() => onPreset(30)}
                            className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === '30' ? 'bg-orange-100 text-[#ff6908] border-[#ff6908]' : 'text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]'}`}
                        >
                            30 Hari
                        </button>
                        <button
                            onClick={onReset}
                            className="text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-md border border-gray-300 hover:border-gray-400"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                {isPickerOpen && (
                    <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-md border border-gray-200">
                        <DateRangePicker
                            ranges={[{
                                startDate: dateRange.startDate ?? new Date(),
                                endDate: dateRange.endDate ?? new Date(),
                                key: 'selection',
                            }]}
                            onChange={onDateChange}
                            maxDate={new Date()}
                            showDateDisplay={false}
                            rangeColors={['#ff6908']}
                            locale={id}
                            className="rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const BankStatementTable: React.FC<BankStatementTableProps> = ({ data }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
                <h2 className="font-semibold text-lg text-gray-800">Bank Statement</h2>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                        <th className="px-4 py-2 text-left font-medium">Deskripsi</th>
                        <th className="px-4 py-2 text-right font-medium">Debit</th>
                        <th className="px-4 py-2 text-right font-medium">Kredit</th>
                        <th className="px-4 py-2 text-right font-medium">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                Tidak ada transaksi pada periode ini.
                            </td>
                        </tr>
                    ) : (
                        data.map((t, idx) => (
                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {format(new Date(t.postDate), 'd MMM yyyy', { locale: id })}
                                </td>
                                <td className="px-4 py-3">{t.remarks}</td>
                                <td className="px-4 py-3 text-right text-red-600 font-mono">
                                    {t.debitAmount > 0 ? formatCurrency(t.debitAmount) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-green-600 font-mono">
                                    {t.creditAmount > 0 ? formatCurrency(t.creditAmount) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-700">
                                    {formatCurrency(t.closingBalance)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

interface BankStatementTableProps {
    data: BankStatementDTO[];
}

const BankStatementPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountResp[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [bankStatementData, setBankStatementData] = useState<BankStatementDTO[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<{
        startDate?: Date;
        endDate?: Date;
        key: 'selection';
    }>({
        startDate: undefined,
        endDate: undefined,
        key: 'selection',
    });
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                setLoading(true);
                await bankStatementService.uploadCsv(file);
                toast.success('File berhasil di-upload dan diproses.', { duration: 1000, dismissible: true });

                if (selectedAccount && dateRange.startDate && dateRange.endDate) {
                    await loadBankStatement();
                }
            } catch (err) {
                console.error(err);
                toast.error('Gagal upload file.', { duration: 1000, dismissible: true });

            } finally {
                setLoading(false);
                e.target.value = "";
            }
        }
    };

    useEffect(() => {
        accountService.getAllAccounts().then(setAccounts);
    }, []);

    useEffect(() => {
        if (selectedAccount && dateRange.startDate && dateRange.endDate) {
            loadBankStatement();
        }
    }, [selectedAccount, dateRange.startDate, dateRange.endDate]);

    const loadBankStatement = async () => {
        if (!selectedAccount || !dateRange.startDate || !dateRange.endDate) return;
        setLoading(true);
        setBankStatementData(null);
        try {
            const data = await bankStatementService.getAll(
                selectedAccount,
                dateRange.startDate,
                dateRange.endDate
            );
            setBankStatementData(data);
        } catch (err) {
            console.error("Failed to load bank statement:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (ranges: RangeKeyDict) => {
        const { selection } = ranges;
        if (selection.endDate && selection.startDate && selection.endDate < selection.startDate) {
            selection.endDate = selection.startDate;
        }
        setDateRange({
            startDate: selection.startDate,
            endDate: selection.endDate,
            key: 'selection'
        });
        setActivePreset(null);
    };

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setDateRange({ startDate: start, endDate: end, key: 'selection' });
        setActivePreset(`${days}`);
    };

    const handleReset = () => {
        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setActivePreset(null);
        setBankStatementData(null);
    };

    const renderContent = () => {
        if (loading) {
            return <Spinner />;
        }
        if (!selectedAccount) {
            return <InfoBlock title="Mulai Analisis" message="Pilih akun untuk melihat rekening koran" />;
        }
        if (bankStatementData) {
            return <BankStatementTable data={bankStatementData} />;
        }
        return <InfoBlock title="Pilih Periode" message="Pilih rentang tanggal untuk melihat rekening koran." />;
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            <Toaster richColors position="top-right" />
            <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <ScrollText className="text-gray-700" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">Bank Statement</h1>
                    </div>

                    <div>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleUploadClick}
                            className="flex items-center gap-2 rounded-lg bg-white border border-orange-500 px-4 py-2 font-semibold text-orange-500 transition-all duration-300 ease-in-out hover:bg-orange-50 hover:text-orange-400 hover:ring-2 hover:ring-orange-300"
                        >
                            <Upload size={18} />
                            Upload CSV
                        </button>

                    </div>
                </div>

                <Controls
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    onAccountChange={setSelectedAccount}
                    dateRange={dateRange}
                    onDateChange={handleDateChange}
                    onPreset={handlePreset}
                    onReset={handleReset}
                    activePreset={activePreset}
                />
                <div className="mt-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default BankStatementPage;