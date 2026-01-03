// components/employees/EmployeeFilter.tsx
import Select, { MultiValue } from 'react-select';

type Option = { value: string; label: string };

interface Props {
  jobReferences: Option[];
  selectedJobRefs: MultiValue<Option>;
  setSelectedJobRefs: (v: MultiValue<Option>) => void;

  educationMin?: string;
  educationMax?: string;
  setEducationMin: (v?: string) => void;
  setEducationMax: (v?: string) => void;

  onApply: () => void;
  onClear: () => void;
}

export default function EmployeeFilter(props: Props) {
  const {
    jobReferences,
    selectedJobRefs,
    setSelectedJobRefs,
    educationMin,
    educationMax,
    setEducationMin,
    setEducationMax,
    onApply,
    onClear
  } = props;

  return (
    <div className="bg-white border rounded-lg p-4 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>
          <label className="text-sm text-gray-600">Job Reference</label>
          <Select
            isMulti
            options={jobReferences}
            value={selectedJobRefs}
            onChange={val => setSelectedJobRefs(val)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Education Min</label>
          <select
            value={educationMin ?? ''}
            onChange={e => setEducationMin(e.target.value || undefined)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">-</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="D3">D3</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Education Max</label>
          <select
            value={educationMax ?? ''}
            onChange={e => setEducationMax(e.target.value || undefined)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">-</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="D3">D3</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClear} className="border px-4 py-2 rounded-md">
          Clear
        </button>
        <button onClick={onApply} className="bg-[#ff6908] text-white px-4 py-2 rounded-md">
          Apply
        </button>
      </div>
    </div>
  );
}
