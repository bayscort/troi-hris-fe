import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Trash,
  MapPin
} from 'lucide-react';

import { Client } from '../types/client';
import { ClientSite } from '../types/client-site';
import { clientService, clientSiteService } from '../services/api';

import ClientSiteForm from '../components/client-site/ClientSiteForm';
import SiteDetailModal from '../components/client-site/SiteDetailModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

const ClientSitePage: React.FC = () => {
  /* ================= STATE ================= */
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const [expandedClients, setExpandedClients] =
    useState<Record<string, boolean>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedSite, setSelectedSite] = useState<ClientSite | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<ClientSite | null>(null);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const clientRes = await clientService.getAllClients();
      setClients(clientRes);

      const sitePromises = clientRes.map(c =>
        clientSiteService.getClientSiteByClientId(c.id!)
      );
      const siteResults = await Promise.all(sitePromises);
      setSites(siteResults.flat());

      // default: collapse all
      const expanded: Record<string, boolean> = {};
      clientRes.forEach(c => {
        if (c.id) expanded[c.id] = false;
      });
      setExpandedClients(expanded);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= GROUP + FILTER ================= */
  const groupedSites = useMemo(() => {
    const result: Record<string, ClientSite[]> = {};

    sites.forEach(site => {
      if (selectedClientId && site.clientId !== selectedClientId) return;

      const keyword = searchTerm.toLowerCase();
      const match =
        site.name.toLowerCase().includes(keyword) ||
        site.address.toLowerCase().includes(keyword);

      if (!match) return;

      if (!result[site.clientId]) result[site.clientId] = [];
      result[site.clientId].push(site);
    });

    return result;
  }, [sites, searchTerm, selectedClientId]);

  /* ================= HELPERS ================= */
  const getClientName = (id: string) =>
    clients.find(c => c.id === id)?.name ?? 'Unknown Client';

  const getClientAddress = (id: string) =>
    clients.find(c => c.id === id)?.address ?? '-';

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    Object.keys(groupedSites).forEach(id => (map[id] = true));
    setExpandedClients(map);
  };

  const collapseAll = () => {
    const map: Record<string, boolean> = {};
    Object.keys(groupedSites).forEach(id => (map[id] = false));
    setExpandedClients(map);
  };

  /* ================= SKELETON ================= */
  const SkeletonRow = () => (
    <div className="grid grid-cols-[3fr_1fr_6fr] items-center px-5 py-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-16 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Client Sites
          </h1>
          <p className="text-sm text-gray-500">
            Manage client locations & geofence radius
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSite(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6908] text-white rounded-lg hover:bg-[#e85f05]"
        >
          <Plus size={16} /> Add Site
        </button>
      </div>

      {/* ===== FILTER ===== */}
      <div className="flex gap-3 items-center max-w-5xl">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            disabled={loading}
            placeholder="Search site or address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white disabled:bg-gray-100"
          />
        </div>

        <select
          disabled={loading}
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100"
        >
          <option value="">All Clients</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={expandAll}
          disabled={loading}
          className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          disabled={loading}
          className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50"
        >
          Collapse All
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* HEADER */}
        <div className="grid grid-cols-[3fr_1fr_6fr] px-5 py-3 text-xs font-semibold text-gray-500 border-b">
          <div>Name</div>
          <div>Sites</div>
          <div>Address</div>
        </div>

        {/* SKELETON */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}

        {/* DATA */}
        {!loading &&
          Object.entries(groupedSites).map(([clientId, clientSites]) => {
            const expanded = expandedClients[clientId];

            return (
              <div key={clientId} className="border-b last:border-b-0">
                {/* CLIENT ROW */}
                <div
                  onClick={() =>
                    setExpandedClients(prev => ({
                      ...prev,
                      [clientId]: !prev[clientId]
                    }))
                  }
                  className="grid grid-cols-[3fr_1fr_6fr] items-center px-5 py-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    {getClientName(clientId)}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{clientSites.length}</span>{' '}
                    sites
                  </div>

                  <a
                    onClick={e => e.stopPropagation()}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      getClientAddress(clientId)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 line-clamp-2 hover:underline"
                  >
                    {getClientAddress(clientId)}
                  </a>
                </div>

                {/* ===== EXPANDED TABLE ===== */}
                {expanded && (
                  <div
                    className="mx-5 mb-4 border rounded-lg overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Site</th>
                          <th className="px-4 py-2 text-left">Address</th>
                          <th className="px-4 py-2 text-right">Radius (m)</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientSites.map(site => (
                          <tr
                            key={site.id}
                            className="border-t hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 font-medium">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-[#ff6908]" />
                                {site.name}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {site.address}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {site.radiusMeters ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedSite(site);
                                    setIsDetailOpen(true);
                                  }}
                                  className="p-1.5 rounded hover:bg-gray-100"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedSite(site);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSiteToDelete(site);
                                    setIsDeleteOpen(true);
                                  }}
                                  className="p-1.5 text-red-500 rounded hover:bg-red-50"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ===== MODALS ===== */}
      <ClientSiteForm
        isOpen={isFormOpen}
        clients={clients}
        site={selectedSite}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          setIsFormOpen(false);
          loadData();
        }}
      />

      <SiteDetailModal
        isOpen={isDetailOpen}
        site={selectedSite}
        clientName={
          selectedSite ? getClientName(selectedSite.clientId) : ''
        }
        onClose={() => setIsDetailOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Site"
        description={`Delete site "${siteToDelete?.name}"? This action cannot be undone.`}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          setSiteToDelete(null);
          loadData();
        }}
      />
    </div>
  );
};

export default ClientSitePage;
