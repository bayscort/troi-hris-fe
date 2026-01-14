import React, { useEffect, useState } from 'react';
import { Client } from '../../types/client';
import { ClientSite } from '../../types/client-site';
import { clientSiteService } from '../../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  clients: Client[];
  site?: ClientSite | null;
  onClose: () => void;
  onSaved: () => void;
}

const ClientSiteForm: React.FC<Props> = ({
  isOpen,
  clients,
  site,
  onClose,
  onSaved
}) => {
  /* ================= STATE ================= */
  const [form, setForm] = useState<Omit<ClientSite, 'id'>>({
    clientId: '',
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    radiusMeters: null,
    active: true
  });

  const [coordinateInput, setCoordinateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  /* ================= INIT ADD / EDIT ================= */
  useEffect(() => {
    if (!isOpen) return;

    if (site) {
      setForm({
        clientId: site.clientId,
        name: site.name,
        address: site.address,
        latitude: site.latitude ?? null,
        longitude: site.longitude ?? null,
        radiusMeters: site.radiusMeters ?? null,
        active: site.active
      });

      setCoordinateInput(
        site.latitude != null && site.longitude != null
          ? `${site.latitude}, ${site.longitude}`
          : ''
      );
    } else {
      setForm({
        clientId: '',
        name: '',
        address: '',
        latitude: null,
        longitude: null,
        radiusMeters: null,
        active: true
      });
      setCoordinateInput('');
    }

    setShowMap(false); // reset
  }, [isOpen, site]);

  if (!isOpen) return null;

  /* ================= COORDINATE PARSER ================= */
  const isValidLatLng = (lat: number, lng: number): boolean =>
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  const parseLatLng = (
    input: string
  ): { lat: number; lng: number } | null => {
    const numbers = input.match(/-?\d+(\.\d+)?/g);
    if (!numbers || numbers.length < 2) return null;

    const lat = Number(numbers[0]);
    const lng = Number(numbers[1]);

    if (!isValidLatLng(lat, lng)) return null;
    return { lat, lng };
  };

  const handleCoordinateChange = (value: string) => {
    setCoordinateInput(value);

    const parsed = parseLatLng(value);
    if (!parsed) {
      setForm(prev => ({
        ...prev,
        latitude: null,
        longitude: null
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      latitude: parsed.lat,
      longitude: parsed.lng
    }));
  };

  /* ================= VALIDATION ================= */
  const isFormValid = (): boolean => {
    if (!form.clientId) return false;
    if (!form.name.trim()) return false;
    if (form.latitude === null || form.longitude === null) return false;

    const radiusValue = form.radiusMeters ?? 0;
    if (radiusValue <= 0) return false;

    return true;
  };

  /* ================= MAP ================= */
  const mapUrl =
    form.latitude !== null && form.longitude !== null
      ? `https://www.google.com/maps?q=${form.latitude},${form.longitude}&z=16&output=embed`
      : null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setSaving(true);

      if (site?.id) {
        await clientSiteService.updateClientSite(site.id, form);
      } else {
        await clientSiteService.createClientSite(form);
      }

      onSaved();
    } catch (error) {
      console.error('Failed to save client site', error);
    } finally {
      setSaving(false);
    }
  };

  /* ================= RADIUS VISUAL ================= */
  const radiusValue = form.radiusMeters ?? 0;
  const radiusPx =
    radiusValue > 0
      ? Math.min(Math.max(radiusValue / 2, 40), 160)
      : 0;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[560px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-3 px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="w-1 h-6 rounded-full bg-[#ff6908]" />
          <h2 className="text-lg font-semibold text-gray-800">
            {site ? 'Edit Client Site' : 'Add Client Site'}
          </h2>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="p-6 space-y-4 text-sm overflow-y-auto">
          {/* CLIENT */}
          <div>
            <label className="block text-gray-600 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={form.clientId}
              onChange={e =>
                setForm({ ...form, clientId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908]/30"
            >
              <option value="">Select Client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SITE NAME */}
          <div>
            <label className="block text-gray-600 mb-1">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908]/30"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-gray-600 mb-1">Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={e =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908]/30"
            />
          </div>

          {/* COORDINATE */}
          <div>
            <label className="block text-gray-600 mb-1">
              Coordinate / Google Maps Link <span className="text-red-500">*</span>
            </label>
            <input
              value={coordinateInput}
              onChange={e =>
                handleCoordinateChange(e.target.value)
              }
              placeholder="-6.175392, 106.827153"
              className="w-full px-3 py-2 border rounded-md focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908]/30"
            />
            {coordinateInput &&
              (form.latitude === null ||
                form.longitude === null) && (
                <p className="text-xs text-red-500 mt-1">
                  Valid coordinate is required
                </p>
              )}
          </div>

          {/* MAP TOGGLE */}
          {mapUrl && (
            <div>
              <button
                type="button"
                onClick={() => setShowMap(v => !v)}
                className="flex items-center gap-1 text-sm text-[#ff6908] hover:underline"
              >
                {showMap ? (
                  <>
                    <ChevronUp size={16} /> Hide map preview
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} /> Show map preview
                  </>
                )}
              </button>

              {showMap && (
                <div className="relative mt-3 border rounded-lg overflow-hidden">
                  <iframe
                    title="Map Preview"
                    src={mapUrl}
                    className="w-full h-[180px]"
                    loading="lazy"
                  />
                  {radiusPx > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="rounded-full border-2 border-[#ff6908] bg-[#ff6908]/20"
                        style={{ width: radiusPx, height: radiusPx }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RADIUS */}
          <div>
            <label className="block text-gray-600 mb-1">
              Radius (meters) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.radiusMeters ?? ''}
              onChange={e =>
                setForm({
                  ...form,
                  radiusMeters: e.target.value
                    ? Number(e.target.value)
                    : null
                })
              }
              className="w-full px-3 py-2 border rounded-md focus:border-[#ff6908] focus:ring-1 focus:ring-[#ff6908]/30"
            />
            {radiusValue <= 0 && (
              <p className="text-xs text-red-500 mt-1">
                Radius must be greater than 0
              </p>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isFormValid()}
            className="px-4 py-2 text-sm rounded-md text-white bg-[#ff6908] hover:bg-[#e85f05] disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientSiteForm;
