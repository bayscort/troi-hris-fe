import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ClientSite } from '../../types/client-site';

interface Props {
  isOpen: boolean;
  site: ClientSite | null;
  clientName: string;
  onClose: () => void;
}

const SiteDetailModal: React.FC<Props> = ({
  isOpen,
  site,
  clientName,
  onClose
}) => {
  const [showMap, setShowMap] = useState(false);

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /* ================= RESET ON OPEN ================= */
  useEffect(() => {
    if (isOpen) setShowMap(false);
  }, [isOpen]);

  if (!isOpen || !site) return null;

  /* ================= MAP & RADIUS ================= */
  const hasCoordinate =
    site.latitude !== null &&
    site.longitude !== null &&
    site.latitude !== undefined &&
    site.longitude !== undefined;

  const mapUrl = hasCoordinate
    ? `https://www.google.com/maps?q=${site.latitude},${site.longitude}&z=16&output=embed`
    : null;

  const radiusValue = site.radiusMeters ?? 0;

  // visual scaling (same logic as ClientSiteForm)
  const radiusPx =
    radiusValue > 0
      ? Math.min(Math.max(radiusValue / 2, 40), 160)
      : 0;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-3 px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="w-1 h-6 rounded-full bg-[#ff6908]" />
          <h2 className="text-lg font-semibold text-gray-800">
            Site Details
          </h2>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="p-6 space-y-4 text-sm overflow-y-auto">
          {/* CLIENT */}
          <div>
            <p className="text-gray-500">Client</p>
            <p className="font-medium">{clientName}</p>
          </div>

          {/* SITE NAME */}
          <div>
            <p className="text-gray-500">Site Name</p>
            <p>{site.name}</p>
          </div>

          {/* ADDRESS */}
          <div>
            <p className="text-gray-500">Address</p>
            <p>{site.address}</p>
          </div>

          {/* COORDINATE */}
          <div className="flex gap-6">
            <div>
              <p className="text-gray-500">Latitude</p>
              <p>{site.latitude ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p>{site.longitude ?? '-'}</p>
            </div>
          </div>

          {/* RADIUS */}
          <div>
            <p className="text-gray-500">Radius</p>
            <p>{radiusValue > 0 ? `${radiusValue} m` : '-'}</p>
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
                    className="w-full h-[200px]"
                    loading="lazy"
                  />

                  {/* RADIUS CIRCLE */}
                  {radiusPx > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="rounded-full border-2 border-[#ff6908] bg-[#ff6908]/20"
                        style={{
                          width: radiusPx,
                          height: radiusPx
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-6 py-4 border-t flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailModal;
