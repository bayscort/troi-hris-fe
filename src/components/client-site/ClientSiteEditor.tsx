import React, { useEffect, useState } from 'react';
import { X, Save, Trash } from 'lucide-react';
import { Client } from '../../types/client';
import { ClientSite } from '../../types/client-site';
// import { clientSiteService } from '../../services/api';

interface Props {
  site: ClientSite;
  clients: Client[];
  onClose: () => void;
  onUpdated: () => void;
}

const ClientSiteEditor: React.FC<Props> = ({
  site,
  clients,
  onClose,
  onUpdated
}) => {
  const [form, setForm] = useState<Omit<ClientSite, 'id'>>(site);
  const [saving, setSaving] = useState(false);

  /* ================= INIT FORM ================= */
  useEffect(() => {
    setForm(site);
  }, [site]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (['latitude', 'longitude', 'radiusMeters'].includes(name)) {
      setForm(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.clientId) return alert('Client required');
    if (!form.name.trim()) return alert('Site name required');
    if (!form.address.trim()) return alert('Address required');

    try {
      setSaving(true);

      // TODO: connect API
      // await clientSiteService.update(site.id!, form);

      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE (OPTIONAL) ================= */
  const handleDelete = async () => {
    if (!window.confirm('Delete this site?')) return;

    try {
      // TODO: connect API
      // await clientSiteService.delete(site.id!);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to delete site');
    }
  };

  return (
    <div className="w-[460px] bg-white border-l flex flex-col h-full">
      {/* HEADER */}
      <div className="px-6 py-4 border-b flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{form.name || 'Edit Site'}</h2>
          <p className="text-sm text-gray-500">
            {clients.find(c => c.id === form.clientId)?.name ?? 'Unknown client'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
        {/* CLIENT */}
        <div>
          <label className="block mb-1 text-gray-600">Client</label>
          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 bg-white"
          >
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* SITE NAME */}
        <div>
          <label className="block mb-1 text-gray-600">Site Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block mb-1 text-gray-600">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* COORDINATES */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-gray-600">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude ?? ''}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude ?? ''}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* RADIUS */}
        <div>
          <label className="block mb-1 text-gray-600">Radius (meters)</label>
          <input
            type="number"
            name="radiusMeters"
            value={form.radiusMeters ?? ''}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={e =>
              setForm(prev => ({ ...prev, active: e.target.checked }))
            }
          />
          <span className="text-sm text-gray-600">Active</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t flex justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <Trash size={14} />
          Delete
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

export default ClientSiteEditor;
