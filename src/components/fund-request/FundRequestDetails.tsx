import React from 'react';
import { FundRequest, FundRequestApprovalLog } from '../../types/fund-request';
import { FileText, X, CheckCircle, Clock, XCircle, User, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatInTimeZone } from 'date-fns-tz';


const APPROVAL_STEPS = [
  'SUBMITTED_BY_ADMIN_OPS',
  'ACKNOWLEDGED_BY_STAFF_OPS',
  'APPROVED_BY_MANAGER_OPS',
  'REVIEWED_BY_FINANCE',
  'APPROVED_BY_MANAGER_FIN',
  'APPROVED_BY_DIRECTOR'
];

function formatJakarta(timestamp?: string | null) {
  if (!timestamp) return "";
  const date = new Date(timestamp + "Z");
  return formatInTimeZone(date, "Asia/Jakarta", "dd/MM/yy HH:mm:ss");
}

const formatStepName = (step: string) => {
  return step
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

type StepStatus = 'completed' | 'current' | 'pending' | 'rejected';

interface ApprovalStepProps {
  status: StepStatus;
  title: string;
  log?: FundRequestApprovalLog;
  isLast?: boolean;
}

const ApprovalStep: React.FC<ApprovalStepProps> = ({ status, title, log, isLast }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'current':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        );
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      case 'pending':
      default:
        return <div className="w-5 h-5 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div></div>;
    }
  };

  const textColor = status === 'pending' ? 'text-gray-400' : 'text-gray-800';
  const detailColor = status === 'pending' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center h-full">
        <div className="z-10 bg-white">{getStatusIcon()}</div>
        {!isLast && <div className="w-0.5 h-full flex-grow bg-gray-200 absolute top-5 left-[9px] z-0" />}
      </div>
      <div className="flex flex-col pb-8 pt-0.5">
        <h4 className={`font-medium ${textColor}`}>{title}</h4>
        {log && (
          <div className={`text-xs mt-1 flex flex-col gap-1 ${detailColor}`}>
            <div className="flex items-center gap-1.5">
              <User size={12} />
              <span>{log.createdBy || 'System'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{formatJakarta(
                (log.stageTimestamp)
              )}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  fundRequest: FundRequest;
}

const FundRequestDetails: React.FC<Props> = ({ isOpen, onClose, fundRequest }) => {
  if (!isOpen) return null;

  const approvedStages = fundRequest.fundRequestApprovalLogList.map(log => log.approvalStage);
  const rejectionLog = fundRequest.fundRequestApprovalLogList.find(log => log.approvalStage === 'REJECTED');
  const isRejected = !!rejectionLog;

  const lastApprovedIndex = (() => {
    for (let i = APPROVAL_STEPS.length - 1; i >= 0; i--) {
      if (approvedStages.includes(APPROVAL_STEPS[i])) {
        return i;
      }
    }
    return -1;
  })();

  const handleExportToPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 10;
    const marginRight = 10;

    const logo = new Image();
    logo.src = '/logo.jpeg';

    // target tinggi logo (menyesuaikan teks, misalnya 12 px ≈ 4 mm)
    const targetHeight = 10; // px pdf
    const aspectRatio = logo.width / logo.height;

    const displayHeight = targetHeight;
    const displayWidth = targetHeight * aspectRatio;

    doc.addImage(logo, 'JPEG', marginLeft, 15, displayWidth, displayHeight);

    const textLeft = marginLeft + displayWidth + 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PT. BERKAH BINA AMANAT', textLeft, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Pramuka Barat No.99b, RT.4/RW.9, Utan Kayu Utara', textLeft, 22);
    doc.text('Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13120', textLeft, 28);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const title = 'NOTA BUKTI PERMINTAAN DANA';
    const textWidth = doc.getTextWidth(title);
    const centerX = pageWidth / 2;
    const textY = 40;
    doc.text(title, centerX, textY, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(centerX - textWidth / 2, textY + 2, centerX + textWidth / 2, textY + 2);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fundRequest.fundRequestCode}`, centerX, 50, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('TANGGAL:', pageWidth - marginRight - 50, 55);
    doc.text(format(new Date(fundRequest.date), 'dd MMMM yyyy'), pageWidth - marginRight - 30, 55);
    doc.text('Vendor: -', marginLeft, 55);
    doc.text('CURR:', pageWidth - marginRight - 50, 60);
    doc.text('IDR', pageWidth - marginRight - 30, 60);
    doc.text('Project: -', marginLeft, 60);

    const tableColumn = ["No", "Keterangan", "Jumlah", "Keterangan/Peruntukan"];
    const tableRows = fundRequest.fundRequestItemList.map((item, index) => [
      index + 1,
      item.description && item.description.trim() !== ""
        ? `${item.financeItem.name} (${item.description})`
        : item.financeItem.name,
      `Rp ${item.amount.toLocaleString()}`,
      `${item.bankAccountNumber}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 64,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0.2,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineWidth: 0.2,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 55 }
      },
      margin: { left: marginLeft, right: marginRight }
    });

    let lastY = (doc as any).lastAutoTable.finalY;
    const requiredSpace = 65;

    if (pageHeight - lastY < requiredSpace) {
      doc.addPage();
      lastY = 20;
    }

    let currentY = lastY;

    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rp ${fundRequest.totalAmount.toLocaleString()}`, pageWidth - marginRight, currentY, { align: 'right' });

    currentY += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Terbilang:', marginLeft, currentY);
    doc.setFont('helvetica', 'bolditalic');
    doc.text(`${fundRequest.totalAmountInWords}`, marginLeft + 20, currentY);

    currentY += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Bukti Dokumen Pendukung:', marginLeft, currentY);
    currentY += 5;
    doc.text('Tanggal Dibutuhkan:', marginLeft, currentY);
    doc.text(format(new Date(fundRequest.date), 'dd MMMM yyyy'), marginLeft + 35, currentY);
    currentY += 5;
    doc.text('Catatan:', marginLeft, currentY);
    currentY += 5;
    doc.text('Dept/Divisi: BBA', marginLeft, currentY);

    const approvalLogs = fundRequest.fundRequestApprovalLogList;
    const findLog = (stage: string) => approvalLogs.find(log => log.approvalStage === stage);
    const submittedLog = findLog('SUBMITTED_BY_ADMIN_OPS');
    const acknowledgedLog = findLog('ACKNOWLEDGED_BY_STAFF_OPS');
    const managerOpsLog = findLog('APPROVED_BY_MANAGER_OPS');
    const financeLog = findLog('REVIEWED_BY_FINANCE');
    const managerLog = findLog('APPROVED_BY_MANAGER_FIN');
    const directorLog = findLog('APPROVED_BY_DIRECTOR');

    autoTable(doc, {
      startY: currentY + 5,
      theme: 'grid',
      head: [
        ['Disetujui', 'Disetujui', 'Diperiksa', 'Disetujui', 'Mengetahui', 'Diajukan Oleh']
      ],
      body: [
        [
          {
            content: directorLog
              ? `Signed by ${directorLog.createdBy}\n${formatJakarta(
                (directorLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
          {
            content: managerLog
              ? `Signed by ${managerLog.createdBy}\n${formatJakarta(
                (managerLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
          {
            content: financeLog
              ? `Signed by ${financeLog.createdBy}\n${formatJakarta(
                (financeLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
          {
            content: managerOpsLog
              ? `Signed by ${managerOpsLog.createdBy}\n${formatJakarta(
                (managerOpsLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
          {
            content: acknowledgedLog
              ? `Signed by ${acknowledgedLog.createdBy}\n${formatJakarta(
                (acknowledgedLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
          {
            content: submittedLog
              ? `Signed by ${submittedLog.createdBy}\n${formatJakarta(
                (submittedLog.stageTimestamp)
              )}`
              : '\n\n',
            styles: { halign: 'center', minCellHeight: 20 }
          },
        ],
        [
          { content: 'Direktur', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'Manager Finance', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'Finance', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'Manager Operasional', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'Staff Operasional', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'Adm Operasional', styles: { halign: 'center', fontStyle: 'bold' } }
        ]
      ],
      styles: {
        fontSize: 6,
        valign: 'middle',
        textColor: [0, 0, 0],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.2,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      },
      margin: { left: marginLeft, right: marginRight }
    });

    doc.save(`FundRequest-${fundRequest.fundRequestCode}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 relative flex gap-8">

        <div className="w-2/3 flex flex-col">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>

          <div className="flex gap-4 mb-6">
            <div className="bg-orange-100 p-3 rounded-xl flex items-center justify-center">
              <FileText size={28} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{fundRequest.fundRequestCode}</h2>
              <p className="text-sm text-gray-500">
                Date: {fundRequest.date} &bull; Total: Rp{fundRequest.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
            <div className="border rounded-lg overflow-y-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Finance Item</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fundRequest.fundRequestItemList.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.financeItem?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{item.description}</td>
                      <td className="px-4 py-3 text-right font-mono">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition">
              Close
            </button>
            <button onClick={handleExportToPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
              <Download size={16} />
              Export to PDF
            </button>
          </div>
        </div>

        <div className="w-1/3 border-l border-gray-200 pl-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Approval Status</h3>
          <div>
            {APPROVAL_STEPS.map((step, index) => {
              const log = fundRequest.fundRequestApprovalLogList.find(l => l.approvalStage === step);
              let status: StepStatus = 'pending';

              if (approvedStages.includes(step)) {
                status = 'completed';
              } else if (index === lastApprovedIndex + 1 && !isRejected) {
                status = 'current';
              }

              return (
                <ApprovalStep
                  key={step}
                  status={status}
                  title={formatStepName(step)}
                  log={log}
                  isLast={index === APPROVAL_STEPS.length - 1 && !isRejected}
                />
              );
            })}

            {isRejected && rejectionLog && (
              <ApprovalStep
                status="rejected"
                title="Rejected"
                log={rejectionLog}
                isLast={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundRequestDetails;