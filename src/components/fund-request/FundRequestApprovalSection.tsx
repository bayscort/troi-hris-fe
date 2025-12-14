import React from "react";
import { FundRequest } from "../../types/fund-request";
import { AlertTriangle, Check, Eye, X, Clock, Pencil } from "lucide-react";

interface Props {
  approvalRequests: FundRequest[];
  loading: boolean;
  error: string | null;
  onApprove: (fr: FundRequest) => void;
  onReject: (fr: FundRequest) => void;
  onView: (fr: FundRequest) => void;
  onEdit: (fr: FundRequest) => void;
  canEdit?: boolean;
  approvalLabel: string;
}

const FundRequestApprovalSection: React.FC<Props> = ({
  approvalRequests,
  loading,
  error,
  onApprove,
  onReject,
  onView,
  onEdit,
  canEdit,
  approvalLabel,
}) => {
  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center rounded-2xl border border-gray-100 bg-white px-8 py-12 shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-8 w-8 rounded-full border-2 border-gray-100"></div>
            <div className="absolute top-0 h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">
            Loading approval requests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-2xl border border-red-100 bg-red-50/50 p-6 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-900">
              Unable to load requests
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (approvalRequests.length === 0) return null;


  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Awaiting Your Action
            </h2>
            <p className="text-sm text-gray-500">
              {approvalRequests.length} request{approvalRequests.length !== 1 ? 's' : ''} pending approval
            </p>
          </div>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
          {approvalRequests.length}
        </div>
      </div>


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {approvalRequests.map((fr) => (
          <div
            key={fr.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-orange-400 to-orange-500"></div>
            
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {fr.fundRequestCode}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
                    <time className="text-xs text-gray-500">{fr.date}</time>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900">
                  {fr.totalAmount?.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }) ?? "N/A"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onApprove(fr)}
                    title={approvalLabel}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600 transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onReject(fr)}
                    title="Reject"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEdit(fr)}
                      title="Edit Request"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}

                </div>
                
                <button
                  onClick={() => onView(fr)}
                  title="View Details"
                  className="flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm"
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FundRequestApprovalSection;