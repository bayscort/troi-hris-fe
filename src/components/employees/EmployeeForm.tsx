import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Save, Loader, Plus, Trash, User, Briefcase, GraduationCap, FileCheck } from 'lucide-react';
import { employeeService, jobReferenceService } from '../../services/api'; // Sesuaikan path import
import { EmployeeFormDto, JobReferenceForm, EducationForm } from '../../types/employee'; // Sesuaikan path import

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee?: EmployeeFormDto;
}

// Helper untuk object kosong
const emptyJobReference = (): JobReferenceForm => ({
  jobReferenceId: '',
  skillLevel: 'BEGINNER',
  experienceYears: 0,
  certified: false,
  primaryReference: false,
});

const emptyEducation = (): EducationForm => ({
  schoolName: '',
  level: 'SD',
  startYear: new Date().getFullYear(),
});

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  
  // State untuk Data Referensi (Dropdown)
  const [jobReferenceOptions, setJobReferenceOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState<EmployeeFormDto>({
    fullName: '',
    employeeNumber: '',
    gender: 'MALE', // Default value
    active: true,
    jobReferences: [],
    educations: [],
  });

  // Load Data awal
  useEffect(() => {
    const init = async () => {
      setLoadingRefs(true);
      try {
        const refs = await jobReferenceService.getAll();
        setJobReferenceOptions(refs);
      } catch (e) {
        console.error("Failed to load references", e);
      } finally {
        setLoadingRefs(false);
      }
    };
    init();

    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  // Handler Umum
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler Job References
  const addJobReference = () => setFormData(prev => ({ ...prev, jobReferences: [...prev.jobReferences, emptyJobReference()] }));
  const removeJobReference = (index: number) => setFormData(prev => ({ ...prev, jobReferences: prev.jobReferences.filter((_, i) => i !== index) }));
  const updateJobReference = (index: number, field: keyof JobReferenceForm, value: any) => {
    const updated = [...formData.jobReferences];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, jobReferences: updated }));
  };

  // Handler Education
  const addEducation = () => setFormData(prev => ({ ...prev, educations: [...prev.educations, emptyEducation()] }));
  const removeEducation = (index: number) => setFormData(prev => ({ ...prev, educations: prev.educations.filter((_, i) => i !== index) }));
  const updateEducation = (index: number, field: keyof EducationForm, value: any) => {
    const updated = [...formData.educations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, educations: updated }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (employee?.id) {
        await employeeService.update(employee.id, formData);
      } else {
        const { id, ...payload } = formData;
        await employeeService.create(payload);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: <User size={18} /> },
    { number: 2, title: 'Job References', icon: <Briefcase size={18} /> },
    { number: 3, title: 'Education', icon: <GraduationCap size={18} /> },
    { number: 4, title: 'Summary', icon: <FileCheck size={18} /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden font-sans">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {employee ? 'Edit Employee' : 'New Employee Onboarding'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-64 bg-gray-50 p-6 border-r border-gray-200 hidden md:block">
            <div className="space-y-4">
              {steps.map((s) => (
                <div 
                  key={s.number} 
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                    currentStep === s.number ? 'bg-white shadow-sm ring-1 ring-gray-200' : ''
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${currentStep === s.number ? 'bg-[#ff6908] text-white' : 
                      currentStep > s.number ? 'bg-orange-100 text-[#ff6908]' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {currentStep > s.number ? '✓' : s.number}
                  </div>
                  <span className={`text-sm font-medium ${currentStep === s.number ? 'text-gray-900' : 'text-gray-500'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 p-8 overflow-y-auto bg-white">
            
            {/* STEP 1: PERSONAL INFO */}
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6908]/20 focus:border-[#ff6908] transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Number</label>
                    <input
                      name="employeeNumber"
                      value={formData.employeeNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6908]/20 focus:border-[#ff6908] transition-all"
                      placeholder="e.g. EMP-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6908]/20 focus:border-[#ff6908] bg-white transition-all"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: JOB REFERENCES */}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Job Experiences</h3>
                  <button onClick={addJobReference} className="flex items-center gap-2 text-sm font-medium text-[#ff6908] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add Position
                  </button>
                </div>
                
                {formData.jobReferences.length === 0 && (
                   <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">No job references added yet.</p>
                   </div>
                )}

                <div className="grid gap-4">
                  {formData.jobReferences.map((jr, i) => (
                    <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative group hover:border-orange-200 transition-colors">
                      <button 
                        onClick={() => removeJobReference(i)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Position</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-[#ff6908] focus:ring-[#ff6908] sm:text-sm"
                            value={jr.jobReferenceId}
                            onChange={e => updateJobReference(i, 'jobReferenceId', e.target.value)}
                          >
                            <option value="">Select Job Reference</option>
                            {jobReferenceOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Years of Exp</label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ff6908] focus:ring-[#ff6908] py-2 px-3 sm:text-sm"
                            value={jr.experienceYears}
                            onChange={e => updateJobReference(i, 'experienceYears', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: EDUCATION */}
            {currentStep === 3 && (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Education History</h3>
                  <button onClick={addEducation} className="flex items-center gap-2 text-sm font-medium text-[#ff6908] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add Education
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.educations.map((edu, i) => (
                    <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <input 
                             placeholder="School / University Name"
                             className="w-full bg-white px-3 py-2 rounded border border-gray-300 focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908] outline-none"
                             value={edu.schoolName}
                             onChange={e => updateEducation(i, 'schoolName', e.target.value)}
                          />
                        </div>
                        <div>
                          <select 
                            className="w-full bg-white px-3 py-2 rounded border border-gray-300 focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908] outline-none"
                            value={edu.level}
                            onChange={e => updateEducation(i, 'level', e.target.value)}
                          >
                            {['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2'].map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => removeEducation(i)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-all">
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                  {formData.educations.length === 0 && (
                      <div className="text-center py-8 text-gray-400 italic">No education history added.</div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: SUMMARY */}
            {currentStep === 4 && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h3>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Basic Info</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Full Name</span>
                      <span className="font-medium">{formData.fullName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Employee No</span>
                      <span className="font-medium">{formData.employeeNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Gender</span>
                      <span className="font-medium">{formData.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       References <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{formData.jobReferences.length}</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {formData.jobReferences.map((j, k) => (
                        <li key={k} className="flex justify-between border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                           <span>{jobReferenceOptions.find(o => o.id === j.jobReferenceId)?.name || 'Unknown Job'}</span>
                           <span className="font-medium">{j.experienceYears} Years</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       Education <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{formData.educations.length}</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {formData.educations.map((e, k) => (
                        <li key={k} className="border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                           <div className="font-medium">{e.schoolName}</div>
                           <div className="text-xs text-gray-500">{e.level} • {e.startYear}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-end items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#ff6908] hover:bg-[#e65e07] shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#ff6908] hover:bg-[#e65e07] shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              Save Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;