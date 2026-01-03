import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Pen,
  X,
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Employee Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-8 py-6 space-y-8 flex-grow">

          {/* BASIC INFO */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
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
                <p className="text-gray-500">Religion</p>
                <p className="text-gray-800">{employee.religion || '—'}</p>
              </div>
            </div>
          </div>

          {/* BIRTH & CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Birth Information</h3>
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

          {/* ADDRESS */}
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

          {/* JOB REFERENCES */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Job References</h3>
            </div>

            {employee.jobReferences.length === 0 && (
              <p className="text-sm text-gray-500">No job references</p>
            )}

            <div className="space-y-3">
              {employee.jobReferences.map((jr, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-white space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800">
                      Job Reference ID
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

          {/* EDUCATION */}
          <div className="bg-gray-50 rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Education</h3>
            </div>

            {employee.educations.length === 0 && (
              <p className="text-sm text-gray-500">No education data</p>
            )}

            <div className="space-y-3">
              {employee.educations.map((edu, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-white"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {edu.schoolName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {edu.level} {edu.major ? `- ${edu.major}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {edu.startYear} – {edu.endYear || 'Present'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
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
