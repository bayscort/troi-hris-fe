import React, { useEffect, useState, useRef } from "react";
import { Plus, Eye, Loader, FileText, Calendar, Download, CheckCircle, AlertTriangle, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { expenditureService, accountService } from "../services/api";
import { ExpenditureDTO } from "../types/expenditure";
import { AccountResp } from "../types/account";
import ExpenditureForm from "../components/expenditure/ExpenditureForm";
import ExpenditureDetails from "../components/expenditure/ExpenditureDetails";
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';



import jsPDF from 'jspdf';
import toWords from 'angka-terbilang-ts';


const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
    }).format(amount);

interface GroupedExpenditure {
    expenditureDate: string;
    batches: ExpenditureDTO[][];
}

const ExpenditurePage: React.FC = () => {
    const [expenditures, setExpenditures] = useState<ExpenditureDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<AccountResp[]>([]);
    const [accountId, setAccountId] = useState<number | undefined>();
    const [isDownloading, setIsDownloading] = useState(false);

    const [selectedExpenditure, setSelectedExpenditure] = useState<ExpenditureDTO | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [dateRange, setDateRange] = useState({
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        key: 'selection',
    });
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(expenditures.length / perPage);
    const currentExpenditures = expenditures.slice((currentPage - 1) * perPage, currentPage * perPage);
    const { authState } = useAuth();


    const hasPermission = (menuName: string, permission: string): boolean => {
        const menu = authState?.menus.find(m => m.name === menuName);
        return menu ? menu.permissions.includes(permission) : false;
    };

    const fetchExpenditures = async () => {
        setLoading(true);
        try {
            const startDate = dateRange.startDate;
            const endDate = dateRange.endDate;
            const data = await expenditureService.getAllExpenditures(accountId, startDate, endDate);
            setExpenditures(data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to fetch expenditures:", error);
        } finally {
            setLoading(false);
        }
    };

    const generatePageForBatch = (doc: jsPDF, batch: ExpenditureDTO[], receiptDate: string, accountType: string, accountName: string) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;

        const drawCheckmark = (x: number, y: number, size: number) => {
            const tickX1 = x + size * 0.2;
            const tickY1 = y + size * 0.5;
            const tickX2 = x + size * 0.45;
            const tickY2 = y + size * 0.75;
            const tickX3 = x + size * 0.8;
            const tickY3 = y + size * 0.25;

            doc.setLineWidth(0.4);
            doc.setLineCap('round');
            doc.line(tickX1, tickY1, tickX2, tickY2);
            doc.line(tickX2, tickY2, tickX3, tickY3);
        };

        const drawHeader = () => {
            doc.addImage('/logo.jpeg', 'JPEG', margin, 5, 20, 10);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('BUKTI PENGELUARAN', pageWidth / 2, 12, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Nomor: ${accountName}`, margin, 20);
            doc.text(
                `Tanggal: ${format(new Date(receiptDate), 'd/M/yy')}`,
                pageWidth - margin,
                20,
                { align: 'right' }
            );

            const boxSize = 3.5;
            const textOffsetY = 2.5;

            const kasX = margin;
            const kasY = 23;
            const bankX = margin + 18;
            const bankY = 23;

            doc.rect(kasX, kasY, boxSize, boxSize);
            doc.text('Kas', kasX + boxSize + 1.5, kasY + textOffsetY);

            doc.rect(bankX, bankY, boxSize, boxSize);
            doc.text('Bank', bankX + boxSize + 1.5, bankY + textOffsetY);

            if (accountType?.toUpperCase() === 'CASH') {
                drawCheckmark(kasX, kasY, boxSize);
            } else if (accountType?.toUpperCase() === 'BANK') {
                drawCheckmark(bankX, bankY, boxSize);
            }

            doc.setLineWidth(0.2);
        };

        drawHeader();

        let yPos = 30;
        const tableTopY = yPos;
        const tableBottomY = pageHeight - 60;

        doc.setLineWidth(0.5);
        doc.rect(margin, tableTopY, pageWidth - margin * 2, tableBottomY - tableTopY);

        const colSplitX = pageWidth - margin - 45;

        doc.line(colSplitX, tableTopY, colSplitX, tableBottomY);

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Keterangan', margin + 2, yPos);
        doc.text('Jumlah', colSplitX + 42, yPos, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        yPos += 8;

        let totalAmount = 0;
        doc.setFont('helvetica', 'normal');
        batch.forEach(item => {
            if (yPos >= tableBottomY - 10) {
                doc.addPage();
                drawHeader();
                yPos = 47;

                doc.setFont('helvetica', 'bold');
                doc.text('Keterangan', margin + 2, yPos);
                doc.text('Jumlah', colSplitX + 42, yPos, { align: 'right' });
                doc.setLineWidth(0.5);
                doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
                yPos += 8;

                doc.setLineWidth(0.5);
                doc.rect(margin, tableTopY, pageWidth - margin * 2, tableBottomY - tableTopY);
                doc.line(colSplitX, tableTopY, colSplitX, tableBottomY);

                doc.setFont('helvetica', 'normal');
            }

            let itemName = item.financeItem?.name || "";
            if (itemName.length > 50) {
                itemName = itemName.substring(0, 50) + "...";
            }

            let note = item.note;
            if (note && note.trim() !== "") {
                itemName += ` (${note})`;
            }

            doc.text(itemName, margin + 2, yPos);
            doc.text(
                formatCurrency(item.amount).replace('IDR', 'Rp'),
                colSplitX + 42,
                yPos,
                { align: 'right' }
            );

            totalAmount += item.amount;
            yPos += 6.5;
        });

        let summaryYPos = tableBottomY - 10;

        doc.setLineWidth(0.2);
        doc.line(margin, summaryYPos, pageWidth - margin, summaryYPos);
        summaryYPos += 6;

        doc.setFont('helvetica', 'bold');
        doc.text('Total', margin + 2, summaryYPos);
        doc.text(
            formatCurrency(totalAmount).replace('IDR', 'Rp'),
            colSplitX + 42,
            summaryYPos,
            { align: 'right' }
        );
        summaryYPos += 10;

        const terbilangText = toWords(totalAmount) + ' Rupiah';
        const finalText = terbilangText.charAt(0).toUpperCase() + terbilangText.slice(1);

        const terbilangLabel = "Terbilang:";
        doc.setFont('helvetica', 'bold');
        doc.text(terbilangLabel, margin + 2, summaryYPos);
        const labelWidth = doc.getTextWidth(terbilangLabel + " ");

        doc.setFont('helvetica', 'italic');
        const splitValue = doc.splitTextToSize(
            finalText,
            pageWidth - margin * 2 - labelWidth
        );
        doc.text(splitValue, margin + 2 + labelWidth, summaryYPos);

        doc.setLineWidth(0.2);
        const signatureY = tableBottomY + 15;
        const signatureBoxHeight = 12;
        const colWidth = (pageWidth - margin * 2) / 4;
        const signatureLabels = ['Dibukukan', 'Disetujui', 'Diperiksa', 'Dibuat'];

        doc.setFont('helvetica', 'normal');
        signatureLabels.forEach((label, index) => {
            const xPos = margin + colWidth * index;
            const textX = xPos + colWidth / 2;

            doc.text(label, textX, signatureY, { align: 'center' });

            doc.rect(xPos + 4, signatureY + 2, colWidth - 8, signatureBoxHeight);

            doc.setFontSize(8);
            doc.text('(............)', textX, signatureY + signatureBoxHeight, { align: 'center' });
            doc.setFontSize(9);
        });

        const journalY = signatureY + signatureBoxHeight + 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Jurnal:', margin, journalY);

        const journalBoxHeight = 18;
        doc.setFont('helvetica', 'normal');
        doc.rect(margin, journalY + 2, pageWidth - margin * 2, journalBoxHeight);

    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const groupedData: GroupedExpenditure[] = await expenditureService.getAllGrouped(
                accountId,
                dateRange.startDate,
                dateRange.endDate
            );

            if (!groupedData || groupedData.length === 0) {
                alert("Tidak ada data untuk diunduh.");
                setIsDownloading(false);
                return;
            }

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a5'
            });

            let isFirstBatch = true;

            groupedData.forEach(group => {
                group.batches.forEach(batch => {
                    if (batch.length > 0) {
                        if (!isFirstBatch) {
                            doc.addPage('a5', 'landscape');
                        }

                        generatePageForBatch(doc, batch, group.expenditureDate, batch[0].account.accountType, batch[0].account.name);
                        isFirstBatch = false;
                    }
                });
            });

            const account = accounts.find(acc => acc.id === accountId);
            const accountName = account ? account.name.replace(/\s/g, '_') : 'All_Accounts';
            const startDate = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : 'start';
            const endDate = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : 'end';

            doc.save(`Bukti_Pengeluaran_${accountName}_${startDate}_sampai_${endDate}.pdf`);

        } catch (error) {
            console.error("Gagal membuat PDF:", error);
            alert("Terjadi kesalahan saat membuat laporan PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 3;

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        pages.push(
            <button
                key="prev"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
                &laquo;
            </button>
        );

        if (totalPages <= maxVisiblePages + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            pages.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    1
                </button>
            );

            if (startPage > 2) {
                pages.push(<span key="start-ellipsis" className="px-2">…</span>);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        {i}
                    </button>
                );
            }

            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="px-2">…</span>);
            }

            pages.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    {totalPages}
                </button>
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
                &raquo;
            </button>
        );

        return pages;
    };

    const handleSuccess = (action: 'created' | 'updated') => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        setNotification({ message: `Expenditure successfully ${action}.`, type: 'success' });
    };

    const handleEditClick = (expenditure: ExpenditureDTO) => {
        setSelectedExpenditure(expenditure);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (expenditure: ExpenditureDTO) => {
        setSelectedExpenditure(expenditure);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedExpenditure?.id) return;
        setDeleteLoading(true);
        try {
            await expenditureService.deleteExpenditure(selectedExpenditure.id);
            setNotification({ message: 'Expenditure deleted successfully.', type: 'success' });
            setRefreshTrigger(x => x + 1);
        } catch (e) {
            setNotification({ message: 'Failed to delete expenditure.', type: 'error' });
            console.error(e);
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedExpenditure(null);
        }
    };

    useEffect(() => {
        fetchExpenditures();
    }, [dateRange, accountId, refreshTrigger]);

    useEffect(() => {
        accountService.getAllAccounts().then(setAccounts).catch(console.error);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setDateRange({ startDate: start, endDate: end, key: 'selection' });
        setActivePreset(`${days}`);
        setIsPickerOpen(false);
    };

    const handleReset = () => {
        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setActivePreset(null);
        setIsPickerOpen(false);
    };

    const handleSelect = (ranges: any) => {
        if (ranges.selection.endDate < ranges.selection.startDate) {
            ranges.selection.endDate = ranges.selection.startDate;
        }
        setDateRange(ranges.selection);
        setActivePreset(null);
    };

    const formatDateRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            return 'Semua Tanggal';
        }
        return `Dari ${format(dateRange.startDate, 'd MMM yyyy')} - ${format(dateRange.endDate, 'd MMM yyyy')}`;
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <FileText className="text-gray-700" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">Expenditures</h1>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
                    >
                        <Plus size={16} /> Add New Expenditure
                    </button>
                </div>

                {notification && (
                    <div className={`mb-4 p-3 rounded-md flex gap-2 text-sm border ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <span>{notification.message}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            Filter Akun
                        </label>
                        <select
                            className="text-sm border border-gray-200 rounded-lg shadow-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            value={accountId ?? ""}
                            onChange={(e) =>
                                setAccountId(e.target.value ? Number(e.target.value) : undefined)
                            }
                        >
                            <option value="">Semua Akun</option>
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
                                    onClick={() => handlePreset(7)}
                                    className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === "7"
                                        ? "bg-orange-100 text-[#ff6908] border-[#ff6908]"
                                        : "text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]"
                                        }`}
                                >
                                    7 Hari
                                </button>
                                <button
                                    onClick={() => handlePreset(30)}
                                    className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === "30"
                                        ? "bg-orange-100 text-[#ff6908] border-[#ff6908]"
                                        : "text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]"
                                        }`}
                                >
                                    30 Hari
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-md border border-gray-300 hover:border-gray-400"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        {isPickerOpen && (
                            <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-md border border-gray-200">
                                <DateRangePicker
                                    ranges={[
                                        {
                                            startDate: dateRange.startDate ?? new Date(),
                                            endDate: dateRange.endDate ?? new Date(),
                                            key: "selection",
                                        },
                                    ]}
                                    onChange={handleSelect}
                                    maxDate={new Date()}
                                    showDateDisplay={false}
                                    rangeColors={["#ff6908"]}
                                    className="rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    {accountId && (
                        <div className="sm:ml-auto">
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="flex items-center gap-1 bg-[#ff6908] text-white text-sm px-2 py-1 rounded-md hover:bg-[#e55e07]"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader size={12} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download size={12} />
                                        Download
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10">
                                        <Loader className="animate-spin mx-auto text-gray-400" />
                                    </td>
                                </tr>
                            ) : currentExpenditures.length > 0 ? (
                                currentExpenditures.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">{format(new Date(r.expenditureDate), "dd MMM yyyy")}</td>
                                        <td className="px-6 py-4">{r.account?.name ?? 'N/A'}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={r.financeItem?.name || 'N/A'}>
                                            {r.financeItem?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(r.amount)}</td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-2">
                                                {hasPermission('expenditure', 'READ') && (
                                                    <button
                                                        onClick={() => { setSelectedExpenditure(r); setIsDetailModalOpen(true); }}
                                                        className="text-gray-500 hover:text-black"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                {hasPermission('expenditure', 'UPDATE') && (
                                                    <button
                                                        onClick={() => handleEditClick(r)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit Expenditure"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}
                                                {hasPermission('expenditure', 'DELETE') && (
                                                    <button
                                                        onClick={() => handleDeleteClick(r)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete Expenditure"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Tidak ada kuitansi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {expenditures.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span>
                            Showing {(currentPage - 1) * perPage + 1}–
                            {Math.min(currentPage * perPage, expenditures.length)} of {expenditures.length}
                        </span>
                        <div className="flex items-center gap-1">{renderPagination()}</div>
                    </div>
                )}
            </main>

            {isCreateModalOpen && (
                <ExpenditureForm
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => handleSuccess('created')}
                />
            )}

            {isEditModalOpen && selectedExpenditure && (
                <ExpenditureForm
                    expenditureToEdit={{
                        id: selectedExpenditure.id,
                        expenditureDate: selectedExpenditure.expenditureDate,
                        accountId: selectedExpenditure.account?.id,
                        financeItemId: selectedExpenditure.financeItem!.id,
                        amount: selectedExpenditure.amount,
                        reconciled: selectedExpenditure.reconciled,
                        note: selectedExpenditure.note
                    }}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedExpenditure(null);
                    }}
                    onSuccess={() => handleSuccess('updated')}
                />
            )}

            {isDetailModalOpen && selectedExpenditure && (
                <ExpenditureDetails
                    expenditure={selectedExpenditure}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedExpenditure(null);
                    }}
                />
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={`expenditure for ${selectedExpenditure?.financeItem?.name || ''} on ${selectedExpenditure ? format(new Date(selectedExpenditure.expenditureDate), "dd MMM yyyy") : ''}`}
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default ExpenditurePage;