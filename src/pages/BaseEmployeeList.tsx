import { useEffect, useState } from 'react';
import { Employee, EmployeeCategory } from '../types/employee';
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
} from 'lucide-react';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetail from '../components/employees/EmployeeDetails';

import * as XLSX from 'xlsx';

const downloadEmployeeTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      'Full Name': '',
      'Employee Number': '',
      'Email': '',
      'Phone': '',
      'Province': '',
      'City': '',
      'Gender': '',
      'Status': '',
    },
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  XLSX.writeFile(wb, 'employee_template.xlsx');
};

const exportEmployeesToExcel = (employees: Employee[]) => {
  const data = employees.map(emp => {
    const jobRefs = emp.jobReferences
      ?.map(jr => `${jr.name ?? '-'} (${jr.experienceYears} yr)`)
      .join(' | ');

    return {
      'Full Name': emp.fullName,
      'Employee Number': emp.employeeNumber,
      'Email': emp.email,
      'Phone': emp.phoneNumber,
      'Province': emp.province,
      'City': emp.city,
      'Gender': emp.gender,
      'Status': emp.active ? 'Active' : 'Inactive',
      'Job References': jobRefs ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  XLSX.writeFile(
    workbook,
    `employees_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};

import { useRef } from 'react';

interface Props {
  category: EmployeeCategory;
  showAddButton?: boolean;
}

export default function BaseEmployeeList({ category, showAddButton }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');

  type FilterOperator = 'eq' | 'gte' | 'lte' | 'contains';
  type LogicalOperator = 'AND' | 'OR';

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
    logic?: LogicalOperator; // AND / OR (hubungan ke row berikutnya)
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

  const updateField = (id: string, field: FilterField) => {
    const def = FILTER_DEFINITIONS.find(d => d.field === field);

    updateFilter(id, {
      field,
      operator: def?.operators[0], // default selalu set
      value: undefined,
    });
  };

  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        logic: 'AND',
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
      let result = true;

      filters.forEach((filter, index) => {
        if (!filter.field || !filter.operator || !filter.value) return;

        const current = evaluateFilter(emp, filter);

        if (index === 0) {
          result = current;
        } else {
          if (filters[index - 1].logic === 'AND') {
            result = result && current;
          }
          if (filters[index - 1].logic === 'OR') {
            result = result || current;
          }
        }
      });

      return result;
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

  const [rawEmployees, setRawEmployees] = useState<Employee[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await employeeService.search({
        category,
        page,
        size: 10,
        });

        setRawEmployees(res.content); // ⬅️ SIMPAN DATA ASLI
    } catch (error) {
        console.error('Failed to fetch employees', error);
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
      let data = [...rawEmployees];
      // SEARCH
      if (search) {
          data = data.filter(e =>
          e.fullName.toLowerCase().includes(search.toLowerCase()) ||
          e.employeeNumber.toLowerCase().includes(search.toLowerCase())
          );
          }

      // FILTER
      data = applyFilters(data);

      // SORT
      data = applySort(data);

      setEmployees(data);

      }, [rawEmployees, search, filters]
    );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (
          sortRef.current &&
          !sortRef.current.contains(e.target as Node)
        ) {
          setSortOpen(false);
        }
      };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    fetchData();
  }, [category, page]);
 
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this employee data? This action cannot be undone.'
      )
    )
      return;

    try {
      await employeeService.delete(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const handleImportExcel = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    const employeesToImport: Employee[] = rows.map(row => ({
      fullName: row['Full Name'],
      employeeNumber: row['Employee Number'],
      email: row['Email'],
      phoneNumber: row['Phone'],
      province: row['Province'],
      city: row['City'],
      gender: row['Gender'],
      active: row['Status'] === 'Active',

      // ✅ WAJIB ADA
      jobReferences: [],
      educations: [],
    }));


    try {
      for (const emp of employeesToImport) {
      await employeeService.create(emp);
      }
      fetchData();
      alert('Import Excel berhasil');
    } catch (err) {
      console.error(err);
      alert('Import gagal');
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
                className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md w-40 focus:ring-2 focus:ring-orange-200"
              />
            </div>

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
                <div className="absolute left-0 mt-2 z-20">
                  <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[320px]">

                    {/* MULTI FILTER ROWS (AND / OR) */}
                    <div className="space-y-2 border-t pt-4">

                      {filters.map((f, idx) => {
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

                            {/* LOGIC (AND / OR) */}
                            {idx < filters.length - 1 && (
                              <select
                                value={f.logic ?? 'AND'}
                                onChange={(e) =>
                                  updateFilter(f.id, {
                                    logic: e.target.value as LogicalOperator,
                                  })
                                }
                                className="text-sm border rounded-md px-2 py-1.5"
                              >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select>
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
                <div className="absolute left-0 mt-2 z-20">
                  <div className="bg-white border rounded-lg shadow-lg p-2 min-w-[180px] space-y-1">
                    <button
                      onClick={() => {
                        setSort({ key: 'fullName', direction: 'asc' });
                        setSortOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Name A–Z
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'fullName', direction: 'desc' });
                        setSortOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Name Z–A
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'experienceYears', direction: 'asc' });
                        setSortOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Experience ↑
                    </button>

                    <button
                      onClick={() => {
                        setSort({ key: 'experienceYears', direction: 'desc' });
                        setSortOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
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
                  <td colSpan={5} className="text-center py-12">
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
                  const primaryJob =
                    emp.jobReferences?.find((jr) => jr.primaryReference) ??
                    emp.jobReferences?.[0];

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-orange-50/30 transition"
                    >
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
                                {/* <span className="font-medium">
                                    {jr.name || '-'}
                                </span> */}

                                {jr.primaryReference && (
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded">
                                    Primary
                                    </span>
                                )}

                                <span className="text-xs text-gray-400">
                                    • {jr.experienceYears} yr
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
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
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
