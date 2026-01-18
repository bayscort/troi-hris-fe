import { useEffect, useState } from 'react';
import {
    clientService,
    clientSiteService,
    employeeService,
} from '../services/api';
import { Client } from '../types/client';
import { ClientSite } from '../types/client-site';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2, Users } from 'lucide-react';

interface SiteData {
    siteName: string;
    count: number;
    color: string;
}

interface ClientDashboardData {
    client: Client;
    sites: ClientSite[];
    totalEmployees: number;
    siteDistribution: SiteData[];
}

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const ActivePlacementPage = () => {
    const [dashboardData, setDashboardData] = useState<ClientDashboardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const clients = await clientService.getAllClients();

            if (!Array.isArray(clients) || clients.length === 0) {
                setDashboardData([]);
                setLoading(false);
                return;
            }

            const promises = clients.map(async (client) => {
                if (!client.id) return null;

                try {
                    // 1. Get Sites for Client
                    const sites = await clientSiteService.getClientSiteByClientId(client.id);

                    if (!Array.isArray(sites) || sites.length === 0) {
                        return {
                            client,
                            sites: [],
                            totalEmployees: 0,
                            siteDistribution: []
                        };
                    }

                    // 2. Get Active Employees for Each Site
                    const siteStatsPromises = sites.map(async (site, index) => {
                        if (!site.id) return { siteName: site.name, count: 0, color: COLORS[index % COLORS.length] };
                        try {
                            // Note: 'getActiveBySite' returns the list of employees. We count them.
                            const employees = await employeeService.getActiveBySite(site.id);
                            return {
                                siteName: site.name,
                                count: Array.isArray(employees) ? employees.length : 0, // Safety check
                                color: COLORS[index % COLORS.length]
                            };
                        } catch (e) {
                            console.error(`Failed to fetch employees for site ${site.id}`, e);
                            return { siteName: site.name, count: 0, color: COLORS[index % COLORS.length] };
                        }
                    });

                    const siteStats = await Promise.all(siteStatsPromises);
                    const total = siteStats.reduce((sum, item) => sum + item.count, 0);

                    return {
                        client,
                        sites,
                        totalEmployees: total,
                        siteDistribution: siteStats.filter(s => s.count > 0) // Only show active sites in chart
                    };
                } catch (err) {
                    console.error(`Failed to fetch data for client ${client.id}`, err);
                    // Return valid client object with 0 data instead of null to show broken client
                    return {
                        client,
                        sites: [],
                        totalEmployees: 0,
                        siteDistribution: []
                    };
                }
            });

            const results = await Promise.all(promises);
            const validResults = results.filter(Boolean) as ClientDashboardData[];
            setDashboardData(validResults);

            if (validResults.length === 0 && clients.length > 0) {
                setError("Loaded clients but failed to retrieve site data.");
            }

        } catch (error: any) {
            console.error('Failed to load dashboard data', error);
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff6908] border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={fetchData}
                        className="mt-2 bg-red-100 px-3 py-1 rounded text-red-800 text-sm hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData || dashboardData.length === 0) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Users size={64} className="mb-4 text-gray-300" />
                <p className="text-xl font-semibold">No Placement Data Found</p>
                <p className="mb-4">There are no clients or active placements to display.</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-[#ff6908] text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                >
                    <Users size={16} /> Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Active Placement</h1>
                    <p className="text-gray-500 mt-1">Real-time overview of workforce deployment per client</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-white border rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Users size={16} /> Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.map((data) => (
                    <div key={data.client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{data.client.name}</h3>
                                    <p className="text-xs text-gray-500">{data.sites.length} Active Sites</p>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 min-h-[250px] relative">
                            {data.totalEmployees > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={data.siteDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="count"
                                            >
                                                {data.siteDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number, name: string) => [
                                                    `${value} Employees`,
                                                    name
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Center Text */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                        <p className="text-2xl font-bold text-gray-800">{data.totalEmployees}</p>
                                        <p className="text-xs text-gray-500 font-medium">Total Employees</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Users size={48} className="mb-2 opacity-20" />
                                    <p className="text-sm">No employees deployed</p>
                                </div>
                            )}
                        </div>

                        {/* Legend / Details */}
                        <div className="mt-4 space-y-3">
                            {data.siteDistribution.map((site) => (
                                <div key={site.siteName} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: site.color }}></div>
                                        <span className="text-gray-600 truncate max-w-[120px]" title={site.siteName}>{site.siteName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-gray-800">{site.count}</span>
                                        <span className="text-gray-400 text-xs w-8 text-right">
                                            {Math.round((site.count / data.totalEmployees) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivePlacementPage;
