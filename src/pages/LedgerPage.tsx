import React, { useState, useEffect, useRef } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { accountService } from '../services/api';
import { AccountLedgerDTO, AccountResp } from '../types/account';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FiBookOpen, FiDatabase } from 'react-icons/fi';
import { Calendar, FileDown } from 'lucide-react';
import * as XLSX from "xlsx-js-style";

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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

const Header: React.FC = () => (
    <div className="flex items-center gap-3 mb-6">
        <FiBookOpen className="text-gray-700" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Buku Besar</h1>
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
    onExport: () => void;
    isExportable: boolean;
}

const Controls: React.FC<ControlsProps> = ({
    accounts,
    selectedAccount,
    onAccountChange,
    dateRange,
    onDateChange,
    onPreset,
    onReset,
    activePreset,
    onExport,
    isExportable,
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
        if (!dateRange.startDate || !dateRange.endDate) return 'Pilih Periode';
        return `${format(dateRange.startDate, 'd MMM yyyy', { locale: id })} - ${format(dateRange.endDate, 'd MMM yyyy', { locale: id })}`;
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
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
                        <option value="">Pilih Akun</option>
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

            {isExportable && (
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-all"
                >
                    <FileDown size={16} />
                    Export (.xlsx)
                </button>
            )}
        </div>
    );
};

interface LedgerTableProps {
    data: AccountLedgerDTO;
}

const LedgerTable: React.FC<LedgerTableProps> = ({ data }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
                <h2 className="font-semibold text-lg text-gray-800">{data.accountName}</h2>
                <p className="text-sm text-gray-500">Laporan Buku Besar</p>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                        <th className="px-4 py-2 text-left font-medium">Deskripsi</th>
                        <th className="px-4 py-2 text-left font-medium w-56">Note</th>
                        <th className="px-4 py-2 text-right font-medium">Debit</th>
                        <th className="px-4 py-2 text-right font-medium">Kredit</th>
                        <th className="px-4 py-2 text-right font-medium">Saldo</th>
                    </tr>
                </thead>

                <tbody>
                    <tr className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">-</td>
                        <td className="px-4 py-3 font-semibold">Saldo Awal</td>
                        <td className="px-4 py-3 text-left">-</td>
                        <td className="px-4 py-3 text-right">-</td>
                        <td className="px-4 py-3 text-right">-</td>
                        <td className="px-4 py-3 text-right font-mono">
                            {formatCurrency(data.openingBalance)}
                        </td>
                    </tr>

                    {data.transactions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-500">
                                Tidak ada transaksi pada periode ini.
                            </td>
                        </tr>
                    ) : (
                        data.transactions.map((t, idx) => (
                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {format(new Date(t.date), 'd MMM yyyy', { locale: id })}
                                </td>

                                <td className="px-4 py-3 text-left">
                                    {t.description}
                                </td>

                                <td className="px-4 py-3 text-left max-w-xs whitespace-normal break-words text-gray-700">
                                    {t.note || '-'}
                                </td>

                                <td className="px-4 py-3 text-right text-red-600 font-mono">
                                    {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                                </td>

                                <td className="px-4 py-3 text-right text-green-600 font-mono">
                                    {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                                </td>

                                <td className="px-4 py-3 text-right font-mono text-gray-700">
                                    {formatCurrency(t.runningBalance)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Saldo Akhir</span>
            <span className="font-bold text-lg text-gray-700">
                {formatCurrency(data.finalBalance)}
            </span>
        </div>
    </div>
);



const LedgerPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountResp[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [ledgerData, setLedgerData] = useState<AccountLedgerDTO | null>(null);
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

    useEffect(() => {
        accountService.getAllAccounts().then(setAccounts);
    }, []);

    useEffect(() => {
        if (selectedAccount && dateRange.startDate && dateRange.endDate) {
            loadLedger();
        } else {
            setLedgerData(null);
        }
    }, [selectedAccount, dateRange]);

    const loadLedger = async () => {
        if (!selectedAccount || !dateRange.startDate || !dateRange.endDate) return;
        setLoading(true);
        setLedgerData(null);
        try {
            const data = await accountService.getLedger(
                selectedAccount,
                dateRange.startDate,
                dateRange.endDate
            );
            setLedgerData(data);
        } catch (err) {
            console.error("Failed to load ledger:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (ranges: RangeKeyDict) => {
        const { selection } = ranges;
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
        start.setDate(end.getDate() - (days - 1));
        setDateRange({ startDate: start, endDate: end, key: 'selection' });
        setActivePreset(`${days}`);
    };

    const handleReset = () => {
        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setSelectedAccount(null);
        setActivePreset(null);
        setLedgerData(null);
    };

    const handleExport = () => {
        if (!ledgerData) return;

        const formatNumber = (num: number | null | undefined) => {
            if (num == null || num === 0) return "-";
            return new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Math.abs(num));
        };

        const getCurrentDate = () => {
            return format(new Date(), "dd MMMM yyyy", { locale: id });
        };

        const accountName = accounts.find((a) => a.id === selectedAccount)?.name || "Akun";

        const header = [
            ["PT. BERKAH BINA AMANAT"],
            ["BUKU BESAR "],
            [],
            [`Nama Akun: ${accountName}`],
            [],
            [],
            [`Tanggal Cetak: ${getCurrentDate()}`],
            [],
            ["No.", "Tanggal", "No. Bukti", "Deskripsi", "Note", "Debit (Rp)", "Kredit (Rp)", "Saldo (Rp)"],
        ];

        const totalDebit = ledgerData.transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
        const totalCredit = ledgerData.transactions.reduce((sum, t) => sum + (t.credit || 0), 0);

        const transactionRows = ledgerData.transactions.map((t, index) => [
            (index + 1).toString(),
            format(new Date(t.date), "dd/MM/yyyy"),
            "-",
            t.description,
            t.note,
            t.debit > 0 ? formatNumber(t.debit) : "-",
            t.credit > 0 ? formatNumber(t.credit) : "-",
            formatNumber(t.runningBalance),
        ]);

        const signatures = [
            'Diketahui Oleh:',
            'Disetujui Oleh:',
            'Diketahui Oleh:',
            'Diperiksa Oleh:',
            'Dibuat Oleh:'
        ];

        const sigGroups = [
            { start: 0, end: 2 },
            { start: 3, end: 3 },
            { start: 4, end: 5 },
            { start: 6, end: 6 },
            { start: 7, end: 7 }
        ];

        const signatureRows = [];
        signatureRows.push([]);

        const titleRow = new Array(8).fill("");
        sigGroups.forEach((group, i) => {
            titleRow[group.start] = signatures[i];
        });
        signatureRows.push(titleRow);

        const spaceRow1 = new Array(8).fill("");
        signatureRows.push(spaceRow1);

        const spaceRow2 = new Array(8).fill("");
        signatureRows.push(spaceRow2);

        const spaceRow3 = new Array(8).fill("");
        signatureRows.push(spaceRow3);

        const nameRow = new Array(8).fill("");
        sigGroups.forEach((group) => {
            nameRow[group.start] = "Nama: _________________";
        });
        signatureRows.push(nameRow);

        const dateRow = new Array(8).fill("");
        sigGroups.forEach((group) => {
            dateRow[group.start] = "Tanggal: _________________";
        });
        signatureRows.push(dateRow);

        const rows = [
            ["", "", "", "SALDO AWAL", "", "", "", formatNumber(ledgerData.openingBalance)],
            [],
            ...transactionRows,
            [],
            ["", "", "", "TOTAL MUTASI", "", formatNumber(totalDebit), formatNumber(totalCredit), ""],
            ["", "", "", "SALDO AKHIR", "", "", "", formatNumber(ledgerData.finalBalance)],
            [],
            ...signatureRows
        ];

        const dataToExport = [...header, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);

        type WSAny = XLSX.WorkSheet & { [key: string]: any };
        const ws: WSAny = worksheet as WSAny;

        const lastRow = dataToExport.length - 1;
        const lastCol = 7;
        ws["!ref"] = XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: lastRow, c: lastCol },
        });

        ws["!cols"] = [
            { wch: 6 },
            { wch: 12 },
            { wch: 12 },
            { wch: 40 },
            { wch: 10 },
            { wch: 22 },
            { wch: 22 },
            { wch: 22 },
        ];

        ws["!merges"] = ws["!merges"] ?? [];
        ws["!rows"] = ws["!rows"] ?? [];
        (ws["!merges"] as XLSX.Range[]).push(
            { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
            { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
            { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } },
            { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } },
            { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } }
        );

        const sigMergeRows = [lastRow - 5, lastRow - 4, lastRow - 3, lastRow - 2, lastRow - 1, lastRow];
        sigMergeRows.forEach((R) => {
            sigGroups.forEach((group) => {
                if (group.start !== group.end) {
                    (ws["!merges"] as XLSX.Range[]).push({
                        s: { r: R, c: group.start },
                        e: { r: R, c: group.end }
                    });
                }
            });
        });

        for (let R = 0; R <= lastRow; R++) {
            for (let C = 0; C <= lastCol; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };

                ws[cellRef].s = {
                    font: { name: "Arial", sz: 9 },
                    alignment: {
                        vertical: "center",
                        horizontal:
                            C >= 5 ? "right"
                                : C === 3 ? "left"
                                    : C === 4 ? "left"
                                        : "center",
                        wrapText: C === 3 || C === 4,

                    },
                };

                if (R === 0) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 14, bold: true },
                        alignment: { horizontal: "center", vertical: "center" },
                    };
                }

                if (R === 1) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 16, bold: true },
                        alignment: { horizontal: "center", vertical: "center" },
                        fill: { fgColor: { rgb: "E8F4FD" } },
                    };
                }

                if (R >= 3 && R <= 6) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 10, bold: R === 3 || R === 4 },
                        alignment: { horizontal: "left", vertical: "center" },
                    };
                }

                if (R === 8) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4472C4" } },
                        border: {
                            top: { style: "medium", color: { rgb: "000000" } },
                            bottom: { style: "medium", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                        alignment: { horizontal: "center", vertical: "center" },
                    };
                }

                if (R === 9) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 9, bold: true },
                        fill: { fgColor: { rgb: "FFF2CC" } },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                    };
                }

                const transactionStartRow = 11;
                const transactionEndRow = transactionStartRow + transactionRows.length - 1;

                if (R >= transactionStartRow && R <= transactionEndRow) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        border: {
                            top: { style: "hair", color: { rgb: "D0D0D0" } },
                            bottom: { style: "hair", color: { rgb: "D0D0D0" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                    };

                    if ((R - transactionStartRow) % 2 === 0) {
                        ws[cellRef].s.fill = { fgColor: { rgb: "F8F9FA" } };
                    }
                }

                const totalRow = transactionEndRow + 2;
                if (R === totalRow) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 9, bold: true },
                        fill: { fgColor: { rgb: "E2EFDA" } },
                        border: {
                            top: { style: "medium", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                    };
                }

                if (R === totalRow + 1) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 9, bold: true },
                        fill: { fgColor: { rgb: "FFE599" } },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "medium", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                    };
                }

                if (R >= lastRow - 6 && R <= lastRow) {
                    ws[cellRef].s = {
                        ...ws[cellRef].s,
                        font: { name: "Arial", sz: 9 },
                        alignment: { horizontal: "center", vertical: "center" },
                    };
                }
            }
        }

        ws["!rows"][0] = { hpx: 25 };
        ws["!rows"][1] = { hpx: 30 };
        ws["!rows"][8] = { hpx: 30 };

        for (let i = lastRow - 6; i <= lastRow; i++) {
            if (i === lastRow - 5) {
                ws["!rows"][i] = { hpx: 25 };
            } else if (i >= lastRow - 4 && i <= lastRow - 2) {
                ws["!rows"][i] = { hpx: 30 };
            } else {
                ws["!rows"][i] = { hpx: 20 };
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, ws, "Buku Besar");

        const cleanAccountName = accountName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
        const dateStr = format(new Date(), "yyyyMMdd");
        const timeStr = format(new Date(), "HHmm");
        const fileName = `BukuBesar_${cleanAccountName}_${dateStr}_${timeStr}.xlsx`;

        XLSX.writeFile(workbook, fileName);

        console.log(`Buku Besar berhasil diekspor: ${fileName}`);
    };



    const renderContent = () => {
        if (loading) {
            return <Spinner />;
        }
        if (!selectedAccount) {
            return <InfoBlock title="Mulai Analisis" message="Pilih akun untuk melihat riwayat transaksinya di buku besar." />;
        }
        if (!dateRange.startDate || !dateRange.endDate) {
            return <InfoBlock title="Pilih Periode" message="Pilih rentang tanggal untuk melihat riwayat transaksi." />;
        }
        if (ledgerData) {
            return <LedgerTable data={ledgerData} />;
        }
        return <InfoBlock title="Data Tidak Ditemukan" message="Tidak ada data buku besar untuk akun dan periode yang dipilih." />;
    };

    const isExportable = !!ledgerData;

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <Header />
                <Controls
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    onAccountChange={setSelectedAccount}
                    dateRange={dateRange}
                    onDateChange={handleDateChange}
                    onPreset={handlePreset}
                    onReset={handleReset}
                    activePreset={activePreset}
                    onExport={handleExport}
                    isExportable={isExportable}
                />
                <div className="mt-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default LedgerPage;