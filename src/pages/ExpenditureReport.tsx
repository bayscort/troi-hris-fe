import React, { useState, useEffect, useRef } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { AccountResp } from '../types/account';
import { accountService, fetchFinanceReport } from '../services/api';
import SectionHeader from '../components/report/SectionHeader';
import ExpenditureSummaryTable from '../components/report/ExpenditureSummaryTable';
import { FileDown } from 'lucide-react';
import * as XLSX from "xlsx-js-style";

const ReportPlaceholder: React.FC = () => (
  <div className="text-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-medium text-gray-700">Laporan Penerimaan</h3>
    <p className="mt-2 text-sm text-gray-500">
      Silakan pilih akun dan rentang tanggal terlebih dahulu untuk menampilkan data laporan.
    </p>
  </div>
);

interface FinanceItem {
  financeItem: string;
  totalTransaction: number;
  totalAmount: number;
}

interface ReportCategory {
  itemCategory: string;
  items: FinanceItem[];
  totalTransaction: number;
  totalAmount: number;
}


export default function ExpenditureReport() {
  const [reportData, setReportData] = useState<ReportCategory[]>([]);
  const [accounts, setAccounts] = useState<AccountResp[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    key: 'selection',
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const onExport = () => {
    if (!reportData || reportData.length === 0) return;

    const totalOverall = reportData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTransactionOverall = reportData.reduce((acc, curr) => acc + curr.totalTransaction, 0);

    const workbook = XLSX.utils.book_new();
    const worksheet: { [key: string]: any } = {};

    const titleStyle = {
      font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2F5597" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thick", color: { rgb: "000000" } }
      }
    };

    const subtitleStyle = {
      font: { bold: true, size: 11, color: { rgb: "444444" } },
      alignment: { horizontal: "left", vertical: "center" },
      fill: { fgColor: { rgb: "F8F9FA" } }
    };

    const headerStyle = {
      font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } }
      }
    };

    const categoryStyle = {
      font: { bold: true, size: 10, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "D9D9D9" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "666666" } },
        bottom: { style: "thin", color: { rgb: "666666" } },
        left: { style: "thin", color: { rgb: "666666" } },
        right: { style: "thin", color: { rgb: "666666" } }
      }
    };

    const categoryNumberStyle = {
      font: { bold: true, size: 10, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "D9D9D9" } },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '#,##0',
      border: {
        top: { style: "thin", color: { rgb: "666666" } },
        bottom: { style: "thin", color: { rgb: "666666" } },
        left: { style: "thin", color: { rgb: "666666" } },
        right: { style: "thin", color: { rgb: "666666" } }
      }
    };

    const itemStyle = {
      font: { size: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "FEFEFE" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "hair", color: { rgb: "CCCCCC" } },
        bottom: { style: "hair", color: { rgb: "CCCCCC" } },
        left: { style: "hair", color: { rgb: "CCCCCC" } },
        right: { style: "hair", color: { rgb: "CCCCCC" } }
      }
    };

    const itemNumberStyle = {
      font: { size: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "FEFEFE" } },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '#,##0',
      border: {
        top: { style: "hair", color: { rgb: "CCCCCC" } },
        bottom: { style: "hair", color: { rgb: "CCCCCC" } },
        left: { style: "hair", color: { rgb: "CCCCCC" } },
        right: { style: "hair", color: { rgb: "CCCCCC" } }
      }
    };

    const totalStyle = {
      font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "E74C3C" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thick", color: { rgb: "000000" } }
      }
    };

    const totalNumberStyle = {
      font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "E74C3C" } },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '#,##0',
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thick", color: { rgb: "000000" } }
      }
    };

    const startStr = dateRange.startDate
      ? format(dateRange.startDate, 'dd/MM/yyyy')
      : 'Semua';
    const endStr = dateRange.endDate
      ? format(dateRange.endDate, 'dd/MM/yyyy')
      : 'Semua';

    let currentRow = 1;

    worksheet['A1'] = { v: 'LAPORAN PENGELUARAN', s: titleStyle };
    worksheet['B1'] = { v: '', s: titleStyle };
    worksheet['C1'] = { v: '', s: titleStyle };
    worksheet['D1'] = { v: '', s: titleStyle };

    currentRow = 2;
    worksheet[`A${currentRow}`] = { v: `Periode: ${startStr} - ${endStr}`, s: subtitleStyle };

    currentRow = 3;
    worksheet[`A${currentRow}`] = { v: `Dibuat pada: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, s: subtitleStyle };

    currentRow = 4;
    worksheet[`A${currentRow}`] = { v: '', s: {} };

    currentRow = 5;
    worksheet[`A${currentRow}`] = { v: 'KATEGORI', s: headerStyle };
    worksheet[`B${currentRow}`] = { v: 'TOTAL TRANSAKSI', s: headerStyle };
    worksheet[`C${currentRow}`] = { v: 'TOTAL JUMLAH', s: headerStyle };
    worksheet[`D${currentRow}`] = { v: 'PERSENTASE', s: headerStyle };

    currentRow++;

    reportData.forEach((category, categoryIndex) => {
      (worksheet as any)[`A${currentRow}`] = { v: category.itemCategory, s: categoryStyle };
      (worksheet as any)[`B${currentRow}`] = { v: category.totalTransaction, s: categoryNumberStyle };
      (worksheet as any)[`C${currentRow}`] = { v: category.totalAmount, s: categoryNumberStyle };
      (worksheet as any)[`D${currentRow}`] = {
        v: `${((category.totalAmount / totalOverall) * 100).toFixed(2)}%`,
        s: categoryStyle
      };
      currentRow++;

      category.items.forEach((item) => {
        (worksheet as any)[`A${currentRow}`] = { v: `    ${item.financeItem}`, s: itemStyle };
        (worksheet as any)[`B${currentRow}`] = { v: item.totalTransaction, s: itemNumberStyle };
        (worksheet as any)[`C${currentRow}`] = { v: item.totalAmount, s: itemNumberStyle };
        (worksheet as any)[`D${currentRow}`] = {
          v: `${((item.totalAmount / totalOverall) * 100).toFixed(2)}%`,
          s: itemStyle
        };
        currentRow++;
      });

      if (categoryIndex < reportData.length - 1) {
        (worksheet as any)[`A${currentRow}`] = { v: '', s: {} };
        currentRow++;
      }
    });

    (worksheet as any)[`A${currentRow}`] = { v: '', s: {} };
    currentRow++;

    (worksheet as any)[`A${currentRow}`] = { v: 'TOTAL KESELURUHAN', s: totalStyle };
    (worksheet as any)[`B${currentRow}`] = { v: totalTransactionOverall, s: totalNumberStyle };
    (worksheet as any)[`C${currentRow}`] = { v: totalOverall, s: totalNumberStyle };
    (worksheet as any)[`D${currentRow}`] = { v: '100.00%', s: totalStyle };

    (worksheet as any)['!ref'] = `A1:D${currentRow}`;

    (worksheet as any)['!cols'] = [
      { width: 35 },
      { width: 18 },
      { width: 20 },
      { width: 15 }
    ];


    (worksheet as any)['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }
    ];


    (worksheet as any)['!rows'] = [];
    (worksheet as any)['!rows'][0] = { hpt: 25 };
    (worksheet as any)['!rows'][4] = { hpt: 20 };

    (worksheet as any)['!margins'] = {
      left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pengeluaran');

    workbook.Props = {
      Title: 'Laporan Pengeluaran',
      Subject: `Laporan Periode ${startStr} - ${endStr}`,
      Author: 'Sistem Pelaporan',
      CreatedDate: new Date()
    };

    const fileStartStr = dateRange.startDate
      ? format(dateRange.startDate, 'yyyyMMdd')
      : 'all';
    const fileEndStr = dateRange.endDate
      ? format(dateRange.endDate, 'yyyyMMdd')
      : 'all';

    XLSX.writeFile(workbook, `LaporanPengeluaran_${fileStartStr}-${fileEndStr}.xlsx`, {
      cellStyles: true,
      sheetStubs: false
    });
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const fetchedAccounts = await accountService.getAllAccounts();
        setAccounts(fetchedAccounts);
      } catch (err) {
        console.error("Gagal mengambil data akun:", err);
        setError("Tidak dapat memuat daftar akun.");
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const loadReportData = async () => {
      if (!selectedAccountId) {
        setReportData([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const startDateStr = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined;
        const endDateStr = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined;

        const data = await fetchFinanceReport('expenditure', selectedAccountId, startDateStr, endDateStr);

        setReportData(data);
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data laporan.');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedAccountId, dateRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      startDate: start,
      endDate: end,
      key: 'selection',
    });
    setActivePreset(`${days}`);
    setIsPickerOpen(false);
  };

  const handleReset = () => {
    setSelectedAccountId(null);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    });
    setReportData([]);
    setError(null);
    setActivePreset(null);
    setIsPickerOpen(false);
  };

  const handleSelect = (ranges: RangeKeyDict) => {
    const { selection } = ranges;
    setDateRange(selection as any);
    setActivePreset(null);
  };

  const formatDateRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Semua Waktu';
    }
    return `${format(dateRange.startDate, 'd MMM yyyy')} - ${format(dateRange.endDate, 'd MMM yyyy')}`;
  };

  if (error) return <div className="text-center text-red-600 p-8">Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white p-8 space-y-6">
      <div className="relative" ref={pickerRef}>
        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedAccountId ?? ''}
            onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : null)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff8533]"
          >
            <option value="">Pilih Akun...</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff8533]"
          >
            {formatDateRange()}
          </button>
          <div className="flex gap-2">
            <button onClick={() => handlePreset(7)} className={`text-sm px-3 py-1 rounded-md border ${activePreset === '7' ? 'bg-[#ff8533] text-white border-[#ff6908]' : 'border-gray-300 text-gray-600 hover:border-[#ff6908]'}`}>
              7 Hari
            </button>
            <button onClick={() => handlePreset(30)} className={`text-sm px-3 py-1 rounded-md border ${activePreset === '30' ? 'bg-[#ff8533] text-white border-[#ff6908]' : 'border-gray-300 text-gray-600 hover:border-[#ff6908]'}`}>
              30 Hari
            </button>
            <button onClick={handleReset} className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:border-[#ff6908]">
              Reset
            </button>
          </div>
          {reportData.length > 0 && (
            <button
              onClick={onExport}
              className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-all"
            >
              <FileDown size={16} />
              Export (.xlsx)
            </button>
          )}
        </div>
        {isPickerOpen && (
          <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-md border border-gray-200">
            <DateRangePicker
              ranges={[dateRange]}
              onChange={handleSelect}
              maxDate={new Date()}
              showDateDisplay={false}
              rangeColors={['#ff6908']}
            />
          </div>
        )}
      </div>

      <main className="space-y-12">
        {selectedAccountId ? (
          <section className="space-y-6">
            <SectionHeader
              title="Laporan Pengeluaran"
              description="Rincian data pengeluaran berdasarkan filter yang dipilih."
            />
            <ExpenditureSummaryTable categories={reportData} loading={loading} />
          </section>
        ) : (
          <ReportPlaceholder />
        )}
      </main>
    </div>
  );
}