import { useEffect, useState } from 'react';
import { Employee, EmployeeCategory } from '../types/employee';
import { employeeService } from '../services/api';
import { Loader, FileText, Pencil, Trash, Plus, Search, Users } from 'lucide-react';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetail from '../components/employees/EmployeeDetails';

interface Props {
    category: EmployeeCategory;
    showAddButton?: boolean;
}

export default function BaseEmployeeList({ category, showAddButton }: Props) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await employeeService.search({
                category,
                page,
                size: 10
            });
            setEmployees(res.content);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [category, page]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this employee data? This action cannot be undone.')) return;
        try {
            await employeeService.delete(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete employee");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-[#ff6908]" />
                        Employee Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your {category.toLowerCase()} staff members.</p>
                </div>
                {showAddButton && (
                    <button
                        onClick={() => { setSelectedEmployee(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[#ff6908] hover:bg-[#e65e07] text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-sm font-medium"
                    >
                        <Plus size={18} /> Add New Employee
                    </button>
                )}
            </div>

            {/* Content Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Optional Toolbar/Filter could go here */}
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Employee No
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Loader className="animate-spin mb-2 text-[#ff6908]" size={24} />
                                            <span className="text-sm">Loading employee data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Search size={48} className="mb-3 opacity-20" />
                                            <span className="text-base font-medium text-gray-900">No employees found</span>
                                            <span className="text-sm mt-1">Try adjusting your filters or add a new employee.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-[#ff6908] font-bold text-sm mr-3">
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{emp.fullName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                            {emp.employeeNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             {/* Contoh Badge Status */}
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setSelectedEmployee(emp); setShowDetail(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-[#ff6908] hover:bg-orange-50 rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedEmployee(emp); setShowForm(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => emp.id && handleDelete(emp.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination footer could go here */}
            </div>

            {/* Modals */}
            {showForm && (
                <EmployeeForm
                    isOpen={showForm}
                    employee={selectedEmployee ?? undefined}
                    onClose={() => { setShowForm(false); setSelectedEmployee(null); }}
                    onSave={() => { setShowForm(false); setSelectedEmployee(null); fetchData(); }}
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