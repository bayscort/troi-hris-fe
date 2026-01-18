import { useEffect, useState, useRef, RefObject } from 'react';
import { Employee, EmployeeCategory, EmployeeFormDto } from '../types/employee';
import { employeeService } from '../services/api';
import {
  Loader,
  FileText,
  Pencil,
  Trash,
  Plus,
  Search,
  Users,
  SlidersHorizontal,
  ArrowUpDown,
  Upload,
  Download,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetail from '../components/employees/EmployeeDetails';

import * as XLSX from 'xlsx';

const downloadEmployeeTemplate = () => {
  const ws = (XLSX.utils as any).json_to_sheet([
    {
      'Full Name': '',
      'Employee Number': '',
      'Identity Number': '',
      'Email': '',
      'Phone': '',
      'Place of Birth': '',
      'Date of Birth': '',
      'Gender': '', // MALE / FEMALE
      'Religion': '',
      'Blood Type': '',
      'Province': '',
      'City': '',
      'District': '',
      'Address': '',
      'Height (cm)': '',
      'Weight (kg)': '',
      'Family Members': '',
      'Emergency Contact Name': '',
      'Emergency Contact Phone': '',
    },
  ]);

  const wb = (XLSX.utils as any).book_new();
  (XLSX.utils as any).book_append_sheet(wb, ws, 'Template');

  XLSX.writeFile(wb, 'employee_template.xlsx');
};

const exportEmployeesToExcel = (employees: Employee[]) => {
  const data = employees.map(emp => {
    const jobRefs = emp.jobReferences
      ?.map(jr => `${jr.name ?? '-'} (${jr.experienceYears} yr)`)
      .join(' | ');

    const educations = emp.educations
      ?.map(edu => `${edu.schoolName} (${edu.level})`)
      .join(' | ');

    return {
      'Full Name': emp.fullName,
      'Employee Number': emp.employeeNumber,
      'Identity Number': emp.identityNumber ?? '',
      'Email': emp.email,
      'Phone': emp.phoneNumber,

      'Place of Birth': emp.placeOfBirth ?? '',
      'Date of Birth': emp.dateOfBirth ?? '',
      'Gender': emp.gender,
      'Religion': emp.religion ?? '',
      'Blood Type': emp.bloodType ?? '',

      'Province': emp.province,
      'City': emp.city,
      'District': emp.district ?? '',
      'Address': emp.fullAddress ?? '',

      'Height (cm)': emp.heightCm ?? '',
      'Weight (kg)': emp.weightKg ?? '',
      'Family Members': emp.familyMemberCount ?? '',

      'Emergency Contact Name': emp.emergencyContactName ?? '',
      'Emergency Contact Phone': emp.emergencyContactPhone ?? '',

      'Status': emp.active ? 'Active' : 'Inactive',
      'Job References': jobRefs ?? '',
      'Educations': educations ?? '',
    };
  });



  const worksheet = (XLSX.utils as any).json_to_sheet(data);
  const workbook = (XLSX.utils as any).book_new();

  (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'Employees');

  XLSX.writeFile(
    workbook,
    `employees_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};


import { useClickOutside } from '../hooks/useClickOutside';

interface Props {
  category: EmployeeCategory;
  showAddButton?: boolean;
}

export default function BaseEmployeeList({ category, showAddButton }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useClickOutside(filterRef as RefObject<HTMLElement>, () => setFilterOpen(false));
  useClickOutside(sortRef as RefObject<HTMLElement>, () => setSortOpen(false));

  type FilterOperator = 'eq' | 'gte' | 'lte' | 'contains';
  // type LogicalOperator = 'AND' | 'OR'; // Removed

  type FilterField =
    | 'fullName'
    | 'employeeNumber'
    | 'province'
    | 'gender'
    | 'active'
    | 'experienceYears';

  interface FilterDefinition {
    field: FilterField;
    label: string;
    operators: FilterOperator[];
    valueType: 'string' | 'number' | 'boolean' | 'enum';
    unit?: string;                 // ✅ NEW
    getOptions?: (employees: Employee[]) => string[];
  }

  const FILTER_DEFINITIONS: FilterDefinition[] = [
    {
      field: 'fullName',
      label: 'Full Name',
      operators: ['contains'],
      valueType: 'string',
    },
    {
      field: 'employeeNumber',
      label: 'Employee Number',
      operators: ['contains'],
      valueType: 'string',
    },
    {
      field: 'province',
      label: 'Province',
      operators: ['eq'],
      valueType: 'enum',
      getOptions: (emps) =>
        [...new Set(
          emps
            .map(e => e.province)
            .filter((v): v is string => Boolean(v))
        )],
    },
    {
      field: 'gender',
      label: 'Gender',
      operators: ['eq'],
      valueType: 'enum',
      getOptions: () => ['MALE', 'FEMALE'],
    },
    {
      field: 'active',
      label: 'Status',
      operators: ['eq'],
      valueType: 'boolean',
      getOptions: () => ['true', 'false'],
    },
    {
      field: 'experienceYears',
      label: 'Experience (Years)',
      operators: ['gte', 'lte'],
      valueType: 'number',
      unit: 'years',
    },
  ];

  interface FilterRow {
    id: string;
    field?: FilterField;
    operator?: FilterOperator;
    value?: string;
    // logic?: LogicalOperator; // Removed
  }

  const [filters, setFilters] = useState<FilterRow[]>([
    { id: crypto.randomUUID() },
  ]);

  const updateFilter = (id: string, patch: Partial<FilterRow>) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, ...patch }
          : f
      )
    );
  };

  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters((prev) =>
      prev.filter((f) => f.id !== id)
    );
  };

  const applyFilters = (data: Employee[]) => {
    if (filters.length === 0) return data;

    return data.filter((emp) => {
      // Logic: ALL filters must match (AND)
      return filters.every(filter => {
        // If filter is incomplete, we treat it as "pass" (ignoring it)
        if (!filter.field || !filter.operator || !filter.value) return true;

        return evaluateFilter(emp, filter);
      });
    });
  };

  const evaluateFilter = (emp: Employee, filter: FilterRow): boolean => {
    const { field, operator, value } = filter;

    switch (field) {
      case 'fullName':
        return emp.fullName
          .toLowerCase()
          .includes(value!.toLowerCase());

      case 'employeeNumber':
        return emp.employeeNumber
          .toLowerCase()
          .includes(value!.toLowerCase());

      case 'province':
        return emp.province === value;

      case 'gender':
        return emp.gender === value;

      case 'active':
        return String(emp.active) === value;

      case 'experienceYears':
        return emp.jobReferences?.some(jr => {
          const exp = jr.experienceYears;
          const val = Number(value);

          switch (operator) {
            case 'gte':
              return exp >= val;
            case 'lte':
              return exp <= val;
            default:
              return false;
          }
        }) ?? false;


      default:
        return true;
    }
  };

  const operatorLabel = (op: FilterOperator) => {
    switch (op) {
      case 'eq':
        return '=';
      case 'gte':
        return '≥';
      case 'lte':
        return '≤';
      case 'contains':
        return 'contains';
      default:
        return op;
    }
  };

  type SortKey = 'fullName' | 'experienceYears';
  type SortDirection = 'asc' | 'desc';

  const [sort, setSort] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

  const applySort = (data: Employee[]) => {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sort.key === 'experienceYears') {
        aVal = Math.max(
          ...(a.jobReferences?.map(j => j.experienceYears) ?? [0])
        );
        bVal = Math.max(
          ...(b.jobReferences?.map(j => j.experienceYears) ?? [0])
        );
      } else {
        aVal = a.fullName.toLowerCase();
        bVal = b.fullName.toLowerCase();
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Renamed to store ALL data
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await employeeService.search({
        category,
        page: 0,
        size: 10000, // Fetch 'all'
      });

      setAllEmployees(res.content); // Store raw full dataset
      // Total elements for client-side search scope is the API total
      // but totalPages will be dynamic based on filtering
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...allEmployees];

    // 1. FILTER & SEARCH (Global scope)
    if (search) {
      data = data.filter(e =>
        e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    data = applyFilters(data);

    // 2. SORT (Global scope)
    data = applySort(data);

    // 3. UPDATE PAGINATION META
    setTotalElements(data.length);
    setTotalPages(Math.ceil(data.length / 10));

    // 4. PAGINATE (Slice for display)
    const startIndex = page * 10;
    const paginatedData = data.slice(startIndex, startIndex + 10);

    setEmployees(paginatedData);

  }, [allEmployees, search, filters, sort, page]); // Depend on page specifically for slicing

  useEffect(() => {
    // Reset page to 0 when filters change to avoid empty views
    setPage(0);
  }, [search, filters, sort]);

  useEffect(() => {
    fetchData();
    setPage(0);
  }, [category]);

  // Reset selection when page or filters change (security: only delete visible)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, filters, category]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Only select items with valid IDs
      const allIds = employees
        .map(emp => emp.id)
        .filter((id): id is string => !!id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.size} employees? This cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    let successCount = 0;

    // Convert to array for iteration
    const idsToDelete = Array.from(selectedIds);

    for (const id of idsToDelete) {
      try {
        await employeeService.delete(id);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete employee ${id}`, error);
      }
    }

    alert(`Successfully deleted ${successCount} employees.`);
    setSelectedIds(new Set());
    fetchData(); // Refresh list
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this employee? This action cannot be undone.'
      )
    )
      return;

    // Optimistic UI
    setAllEmployees(prev => prev.filter(e => e.id !== id));

    try {
      await employeeService.delete(id);

      // Optional: re-fetch to ensure consistency
      fetchData();

    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete employee');
      fetchData(); // rollback
    }
  };

  const handleImportExcel = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Fetch existing employees for duplicate checking
    let existingEmails = new Set<string>();
    try {
      // Fetch a large page to cover most employees for client-side check
      // Ideally this should be server-side, but per instruction we do it here.
      const res = await employeeService.search({
        category: 'ALL', // Check against ALL categories
        page: 0,
        size: 3000,
      });
      res.content.forEach(emp => {
        if (emp.email) {
          existingEmails.add(emp.email.trim().toLowerCase());
        }
      });
    } catch (err) {
      console.error('Failed to fetch existing employees for dup check', err);
      // We proceed, but duplication check might be weak
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    // Helper to parse diverse date formats
    const parseExcelDate = (input: any): string | undefined => {
      if (!input) return undefined;

      // 1. Handle Excel Serial Date (e.g., 44562)
      if (typeof input === 'number') {
        const date = new Date(Math.round((input - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
      }

      // 2. Handle String Dates
      if (typeof input === 'string') {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      return undefined;
    };

    let createdCount = 0;
    let skippedCount = 0;

    const employeesToImport: EmployeeFormDto[] = [];

    for (const row of rows) {
      const email = row['Email'] ? String(row['Email']).trim() : undefined;
      const hasEmployeeNumber = !!row['Employee Number'];

      // DUPLICATION CHECK:
      // If NO employee number is provided (which means we would generate a random IMP-id),
      // AND the email already exists in our database -> SKIP IT.
      if (!hasEmployeeNumber && email && existingEmails.has(email.toLowerCase())) {
        skippedCount++;
        continue;
      }

      employeesToImport.push({
        fullName: row['Full Name'] || 'Unknown Employee',
        // Generate temp ID if missing
        employeeNumber: hasEmployeeNumber
          ? String(row['Employee Number'])
          : `IMP-${Math.floor(Math.random() * 10000)}`,

        email: email,
        phoneNumber: row['Phone'] ? String(row['Phone']) : undefined,
        province: row['Province'],
        city: row['City'],
        gender: row['Gender'] ? (row['Gender'].toString().toUpperCase() as 'MALE' | 'FEMALE') : 'MALE',
        active: true,

        identityNumber: row['Identity Number'] ? String(row['Identity Number']) : undefined,
        placeOfBirth: row['Place of Birth'],
        dateOfBirth: parseExcelDate(row['Date of Birth']),
        religion: row['Religion'],
        bloodType: row['Blood Type'],
        district: row['District'],
        fullAddress: row['Address'],
        heightCm: row['Height (cm)'] ? Number(row['Height (cm)']) : undefined,
        weightKg: row['Weight (kg)'] ? Number(row['Weight (kg)']) : undefined,
        familyMemberCount: row['Family Members'] ? Number(row['Family Members']) : undefined,
        emergencyContactName: row['Emergency Contact Name'],
        emergencyContactPhone: row['Emergency Contact Phone'] ? String(row['Emergency Contact Phone']) : undefined,

        jobReferences: [],
        educations: [],
      });
    }

    try {
      for (const emp of employeesToImport) {
        await employeeService.create(emp);
        createdCount++;
      }
      fetchData();
      alert(`Import Selesai.\nBerhasil dibuat: ${createdCount}\nDilewati (Email Duplikat): ${skippedCount}`);
    } catch (err) {
      console.error(err);
      alert('Import gagal sebagian atau sepenuhnya. Cek console.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-[#ff6908]" />
            Employee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your {category.toLowerCase()} staff members.
          </p>

          {selectedIds.size > 0 && (
            <div className="mt-2 text-sm text-[#ff6908] bg-orange-50 inline-block px-3 py-1 rounded-md border border-orange-100 animate-[fadeIn_0.2s_ease-out]">
              <span className="font-medium">{selectedIds.size}</span> selected
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">

          {/* LEFT: SEARCH / FILTER / SORT */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md w-40 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 transition-colors animate-[fadeIn_0.2s_ease-out]"
              >
                <Trash size={16} />
                Delete ({selectedIds.size})
              </button>
            )}

            <div ref={filterRef} className="relative">
              {/* BUTTON */}
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>

              {/* DROPDOWN */}
              {filterOpen && (
                <div className="absolute left-0 mt-2 z-20 animate-[fadeIn_0.2s_ease-out]">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-xl p-3 min-w-[320px]">

                    {/* MULTI FILTER ROWS (AND / OR) */}
                    <div className="space-y-2 border-t pt-4">

                      {filters.map((f) => {
                        const def = FILTER_DEFINITIONS.find(d => d.field === f.field);

                        return (
                          <div
                            key={f.id}
                            className="flex flex-wrap items-center gap-2"
                          >
                            {/* FIELD */}
                            <select
                              value={f.field ?? ''}
                              onChange={(e) => {
                                const field = e.target.value as FilterField;
                                const def = FILTER_DEFINITIONS.find(d => d.field === field);

                                updateFilter(f.id, {
                                  field,
                                  operator: def?.operators[0], // ✅ auto set default operator
                                  value: undefined,
                                });
                              }}
                              className="text-sm border rounded-md px-2 py-1.5"
                            >
                              <option value="">Field</option>
                              {FILTER_DEFINITIONS.map(d => (
                                <option key={d.field} value={d.field}>
                                  {d.label}
                                </option>
                              ))}
                            </select>

                            {/* OPERATOR (TAMPIL HANYA JIKA > 1) */}
                            {def && def.operators.length > 1 && (
                              <select
                                value={f.operator ?? def.operators[0]}
                                onChange={(e) =>
                                  updateFilter(f.id, {
                                    operator: e.target.value as FilterOperator,
                                  })
                                }
                                className="text-sm border rounded-md px-2 py-1.5"
                              >
                                {def.operators.map(op => (
                                  <option key={op} value={op}>
                                    {operatorLabel(op)}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* VALUE */}
                            {def && (
                              def.valueType === 'number' ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={f.value ?? ''}
                                    onChange={(e) =>
                                      updateFilter(f.id, { value: e.target.value })
                                    }
                                    className="text-sm border rounded-md px-2 py-1.5 w-28"
                                    placeholder={`Enter ${def.unit ?? 'value'}`}   // ✅ step 3
                                    min={0}
                                  />

                                  {/* AUTO UNIT – step 2 */}
                                  {def.unit && (
                                    <span className="text-sm text-gray-500">
                                      {def.unit}
                                    </span>
                                  )}
                                </div>
                              ) : def.getOptions ? (
                                <select
                                  value={f.value ?? ''}
                                  onChange={(e) =>
                                    updateFilter(f.id, { value: e.target.value })
                                  }
                                  className="text-sm border rounded-md px-2 py-1.5"
                                >
                                  <option value="">Value</option>
                                  {def.getOptions(employees).map(v => (
                                    <option key={v} value={v}>
                                      {def.valueType === 'boolean'
                                        ? v === 'true'
                                          ? 'Active'
                                          : 'Inactive'
                                        : v}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  value={f.value ?? ''}
                                  onChange={(e) =>
                                    updateFilter(f.id, { value: e.target.value })
                                  }
                                  className="text-sm border rounded-md px-2 py-1.5"
                                  placeholder="Value"
                                />
                              )
                            )}

                            {/* REMOVE */}
                            {filters.length > 1 && (
                              <button
                                onClick={() => removeFilter(f.id)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* ADD FILTER */}
                      <button
                        onClick={addFilter}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        + Add Filter
                      </button>
                    </div>
                    {/* (kode filter kamu tetap, hanya dipindahkan) */}
                  </div>
                </div>
              )}
            </div>

            <div ref={sortRef} className="relative">
              {/* BUTTON */}
              <button
                onClick={() => setSortOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                <ArrowUpDown size={16} />
                Sort
              </button>

              {/* DROPDOWN */}
              {sortOpen && (
                <div className="absolute left-0 mt-2 z-20 animate-[fadeIn_0.2s_ease-out]">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-xl p-2 min-w-[180px] space-y-1">
                    <button
                      onClick={() => {
                        setSort({ key: 'fullName', direction: 'asc' });
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded
                        ${sort?.key === 'fullName' && sort.direction === 'asc'
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'}`}
                    >
                      Name A–Z
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'fullName', direction: 'desc' });
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded
                        ${sort?.key === 'fullName' && sort.direction === 'desc'
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'}`}
                    >
                      Name Z–A
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'experienceYears', direction: 'asc' });
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded
                        ${sort?.key === 'experienceYears' && sort.direction === 'asc'
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'}`}
                    >
                      Experience ↑
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'experienceYears', direction: 'desc' });
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded
                        ${sort?.key === 'experienceYears' && sort.direction === 'desc'
                          ? 'bg-orange-100 text-orange-700'
                          : 'hover:bg-gray-100'}`}
                    >
                      Experience ↓
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            {showAddButton && (
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-[#ff6908] hover:bg-[#e65e07] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <Plus size={16} />
                Add Employee
              </button>
            )}

            <button
              onClick={() => exportEmployeesToExcel(employees)}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md text-sm"
            >
              <Upload size={16} />
              Export
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md text-sm"
            >
              <Download size={16} />
              Import
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />

            <button
              onClick={downloadEmployeeTemplate}
              className="text-sm text-gray-500 hover:underline whitespace-nowrap"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#ff6908] focus:ring-orange-200"
                    onChange={handleSelectAll}
                    checked={
                      employees.length > 0 &&
                      employees.every(e => e.id && selectedIds.has(e.id))
                    }
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Domicile
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Job Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader
                      className="animate-spin mx-auto text-[#ff6908]"
                      size={24}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading employee data...
                    </p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Search size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">
                      No employees found
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  return (
                    <tr
                      key={emp.id}
                      className={`transition ${selectedIds.has(emp.id!) ? 'bg-orange-50/60' : 'hover:bg-orange-50/30'}`}
                    >
                      {/* CHECKBOX */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#ff6908] focus:ring-orange-200"
                          checked={!!emp.id && selectedIds.has(emp.id)}
                          onChange={() => emp.id && handleSelectOne(emp.id)}
                        />
                      </td>
                      {/* NAME */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-orange-100 text-[#ff6908] flex items-center justify-center font-bold">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium text-gray-900">
                              {emp.fullName}
                            </p>
                            <p className="text-xs text-gray-500">{emp.employeeNumber}</p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emp.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {emp.phoneNumber}
                          </p>
                        </div>
                      </td>

                      {/* DOMICILE */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emp.province}
                          </p>
                          <p className="text-xs text-gray-500">
                            {emp.city}
                          </p>
                        </div>
                      </td>

                      {/* JOB REFERENCE (SHOW ALL) */}
                      <td className="text-sm font-medium text-gray-900">
                        {emp.jobReferences && emp.jobReferences.length > 0 ? (
                          <div className="space-y-2">
                            {emp.jobReferences.map((jr, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  {jr.jobReference?.name ?? jr.name ?? '-'}
                                </span>

                                {jr.primaryReference && (
                                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded">
                                    Primary
                                  </span>
                                )}

                                <span className="text-xs text-gray-400">
                                  ({jr.experienceYears} yr)
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-gray-400">
                            No job reference
                          </span>
                        )}
                      </td>


                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {emp.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setShowDetail(true);
                            }}
                            className="p-1.5 hover:bg-orange-50 rounded"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setShowForm(true);
                            }}
                            className="p-1.5 hover:bg-blue-50 rounded"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              emp.id && handleDelete(emp.id)
                            }
                            className="p-1.5 hover:bg-red-50 rounded"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page + 1}</span> of{' '}
              <span className="font-medium">{totalPages}</span> ({totalElements} results)
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ArrowLeft size={16} />
              </button>

              {/* Simple Page Indicator */}
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                {page + 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ArrowRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showForm && (
        <EmployeeForm
          isOpen={showForm}
          employee={selectedEmployee ?? undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedEmployee(null);
          }}
          onSave={() => {
            setShowForm(false);
            setSelectedEmployee(null);
            fetchData();
          }}
        />
      )}

      {showDetail && selectedEmployee && (
        <EmployeeDetail
          isOpen={showDetail}
          employee={selectedEmployee}
          onClose={() => setShowDetail(false)}
          onEdit={() => {
            setShowDetail(false);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}
