import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Ruler,
  PhoneCall,
  CheckCircle,
  X,
  Pen,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { EmployeeFormDto } from '../../types/employee';

interface EmployeeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeFormDto;
  onEdit: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit,
}) => {

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // HEADER
    doc.setFontSize(20);
    doc.setTextColor(255, 105, 8); // #ff6908
    doc.text('Employee Profile', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 28);

    // SEPARATOR
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let finalY = 35;

    // SECTION 1: PERSONAL INFO
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Personal Information', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 15,
      head: [],
      body: [
        ['Full Name', employee.fullName],
        ['Employee ID', employee.employeeNumber],
        ['Gender', employee.gender || '-'],
        ['Status', employee.active ? 'Active' : 'Inactive'],
        ['Identity Number (KTP)', employee.identityNumber || '-'],
        ['Religion', employee.religion || '-'],
        ['Blood Type', employee.bloodType || '-'],
        ['Place/Date of Birth', `${employee.placeOfBirth || '-'}, ${employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'dd MMM yyyy') : '-'}`],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    finalY = (doc as any).lastAutoTable.finalY;

    // SECTION 2: CONTACT & ADDRESS
    doc.text('Contact & Address', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 15,
      head: [],
      body: [
        ['Email', employee.email || '-'],
        ['Phone', employee.phoneNumber || '-'],
        ['Address', employee.fullAddress || '-'],
        ['Location', [employee.district, employee.city, employee.province].filter(Boolean).join(', ') || '-'],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    finalY = (doc as any).lastAutoTable.finalY;

    // SECTION 3: PHYSICAL & FAMILY
    doc.text('Physical & Family', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 15,
      head: [],
      body: [
        ['Height', employee.heightCm ? `${employee.heightCm} cm` : '-'],
        ['Weight', employee.weightKg ? `${employee.weightKg} kg` : '-'],
        ['Family Members', employee.familyMemberCount ?? '-'],
        ['Emergency Contact', `${employee.emergencyContactName || '-'} (${employee.emergencyContactPhone || '-'})`],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    finalY = (doc as any).lastAutoTable.finalY;

    // SECTION 4: JOB REFERENCES
    doc.text('Job Experiences', 14, finalY + 10);

    const jobRows = employee.jobReferences.map(jr => [
      jr.jobReference?.name ?? jr.name ?? '-',
      `${jr.experienceYears} yr`,
      jr.skillLevel,
      jr.primaryReference ? 'Yes' : 'No'
    ]);

    if (jobRows.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('No job references recorded.', 14, finalY + 20);
      finalY += 25;
    } else {
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Position', 'Experience', 'Level', 'Primary']],
        body: jobRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 105, 8] },
        styles: { fontSize: 9 },
      });
      finalY = (doc as any).lastAutoTable.finalY;
    }

    // SECTION 5: EDUCATION
    // Check if we need a new page
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Education History', 14, finalY + 10);

    const eduRows = employee.educations.map(edu => [
      edu.schoolName,
      edu.level,
      `${edu.startYear} - ${edu.endYear || 'Present'}`
    ]);

    if (eduRows.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('No education history recorded.', 14, finalY + 20);
    } else {
      autoTable(doc, {
        startY: finalY + 15,
        head: [['School / University', 'Level', 'Period']],
        body: eduRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 105, 8] },
        styles: { fontSize: 9 },
      });
    }

    // SAVE
    doc.save(`Profile_${employee.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        {/* ... (existing header) ... */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Employee Details</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-[#ff6908] hover:bg-orange-50 rounded-full transition-colors flex items-center gap-2"
              title="Download PDF"
            >
              <Download size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY */}
        {/* ... (existing body code, UNCHANGED) ... */}
        <div className="overflow-y-auto px-8 py-6 space-y-8 flex-grow">
          {/* ... all existing sections ... */}
          {/* STEP 1: PERSONAL INFO */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="text-gray-800">{employee.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">Employee Number</p>
                <p className="text-gray-800">{employee.employeeNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="text-gray-800">{employee.gender || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Identity Number</p>
                <p className="text-gray-800">{employee.identityNumber || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Religion</p>
                <p className="text-gray-800">{employee.religion || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Blood Type</p>
                <p className="text-gray-800">{employee.bloodType || '—'}</p>
              </div>
            </div>
          </div>

          {/* STEP 2: BIRTH, CONTACT & ADDRESS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Birth Information
                </h3>
              </div>
              <p className="text-sm text-gray-800">
                {employee.placeOfBirth || '—'}
              </p>
              <p className="text-sm text-gray-500">
                {employee.dateOfBirth
                  ? format(new Date(employee.dateOfBirth), 'dd MMMM yyyy')
                  : '—'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Contact</h3>
              </div>
              <p className="text-sm text-gray-800">
                Email: {employee.email || '—'}
              </p>
              <p className="text-sm text-gray-800">
                Phone: {employee.phoneNumber || '—'}
              </p>
            </div>

          </div>

          <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Address</h3>
            </div>
            <p className="text-sm text-gray-800">{employee.fullAddress || '—'}</p>
            <p className="text-sm text-gray-500">
              {[employee.district, employee.city, employee.province]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>

          {/* STEP 3: PHYSICAL & FAMILY */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">
                Physical & Family
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Height</p>
                <p className="text-gray-800">
                  {employee.heightCm ? `${employee.heightCm} cm` : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Weight</p>
                <p className="text-gray-800">
                  {employee.weightKg ? `${employee.weightKg} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Family Members</p>
                <p className="text-gray-800">
                  {employee.familyMemberCount ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Employment Status</p>
                <p className="text-gray-800 flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-600" />
                  {employee.active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 4: EMERGENCY CONTACT */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">
                Emergency Contact
              </h3>
            </div>
            <p className="text-sm text-gray-800">
              {employee.emergencyContactName || '—'}
            </p>
            <p className="text-sm text-gray-500">
              {employee.emergencyContactPhone || '—'}
            </p>
          </div>

          {/* STEP 5: JOB REFERENCES */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">
                Job References
              </h3>
            </div>

            {employee.jobReferences.length === 0 && (
              <p className="text-sm text-gray-500">No job references</p>
            )}

            <div className="space-y-3">
              {employee.jobReferences.map((jr, i) => (
                <div key={i} className="border rounded-lg p-4 bg-white space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {jr.jobReference?.name ?? jr.name ?? 'Job Reference'}
                    </p>
                    {jr.primaryReference && (
                      <span className="text-xs bg-orange-100 text-[#e55e07] px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Skill Level: {jr.skillLevel}
                  </p>
                  <p className="text-sm text-gray-600">
                    Experience: {jr.experienceYears} year(s)
                  </p>
                  {jr.certified && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <ShieldCheck size={14} />
                      Certified
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 6: EDUCATION */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Education</h3>
            </div>

            {employee.educations.length === 0 && (
              <p className="text-sm text-gray-500">No education data</p>
            )}

            <div className="space-y-3">
              {employee.educations.map((edu, i) => (
                <div key={i} className="border rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-800">
                    {edu.schoolName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {edu.level}
                  </p>
                  <p className="text-xs text-gray-500">
                    {edu.startYear}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-sm border border-[#ff6908] text-[#ff6908] hover:bg-orange-50 rounded-lg flex items-center gap-2"
          >
            <Download size={16} /> Download PDF
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-[#ff6908] text-white rounded-lg hover:bg-[#e55e07] flex items-center gap-2"
          >
            <Pen size={16} />
            Edit Employee
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetail;
