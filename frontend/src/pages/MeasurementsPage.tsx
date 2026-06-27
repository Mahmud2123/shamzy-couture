import React, { useEffect, useState } from 'react';
import { measurementsService } from '../services/measurements';
import { Measurement, ProductType, MeasureUnit, MEASUREMENT_FIELDS } from '../types';
import { FiPlus, FiTrash2, FiEdit2, FiTool, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PRODUCT_TYPES: ProductType[] = ['SUIT', 'SHIRT', 'TROUSER', 'JACKET', 'CUSTOM'];

const TYPE_COLORS: Record<ProductType, string> = {
  SUIT: 'bg-blue-100 text-blue-700',
  SHIRT: 'bg-green-100 text-green-700',
  TROUSER: 'bg-purple-100 text-purple-700',
  JACKET: 'bg-amber-100 text-amber-700',
  CUSTOM: 'bg-stone-100 text-stone-700',
};

function emptyForm(type: ProductType) {
  return Object.fromEntries(MEASUREMENT_FIELDS[type].map(f => [f.key, '']));
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Measurement | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [productType, setProductType] = useState<ProductType>('SUIT');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MeasureUnit>('CM');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(emptyForm('SUIT'));

  const load = () => {
    setLoading(true);
    measurementsService.getMyMeasurements(typeFilter || undefined)
      .then(setMeasurements)
      .catch(() => toast.error('Failed to load measurements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter]);

  const handleTypeChange = (t: ProductType) => {
    setProductType(t);
    setFieldValues(emptyForm(t));
  };

  const openNew = () => {
    setEditTarget(null);
    setProductType('SUIT');
    setName('');
    setUnit('CM');
    setIsDefault(false);
    setNotes('');
    setFieldValues(emptyForm('SUIT'));
    setShowForm(true);
  };

  const openEdit = (m: Measurement) => {
    setEditTarget(m);
    setProductType(m.productType);
    setName(m.name);
    setUnit(m.unit);
    setIsDefault(m.isDefault);
    setNotes(m.notes || '');
    // Populate field values from stored measurements object
    const vals: Record<string, string> = {};
    MEASUREMENT_FIELDS[m.productType].forEach(f => {
      vals[f.key] = m.measurements[f.key] != null ? String(m.measurements[f.key]) : '';
    });
    setFieldValues(vals);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Please enter a name'); return; }
    const measurements: Record<string, number | null> = {};
    MEASUREMENT_FIELDS[productType].forEach(f => {
      measurements[f.key] = fieldValues[f.key] !== '' ? Number(fieldValues[f.key]) : null;
    });

    setSaving(true);
    try {
      if (editTarget) {
        const updated = await measurementsService.update(editTarget.id, { name, unit, measurements, isDefault, notes: notes || undefined });
        setMeasurements(prev => prev.map(m => m.id === updated.id ? updated : m));
        toast.success('Measurements updated!');
      } else {
        const created = await measurementsService.create({ name, productType, unit, measurements, isDefault, notes: notes || undefined });
        setMeasurements(prev => [created, ...prev]);
        toast.success('Measurements saved!');
      }
      setShowForm(false);
      setEditTarget(null);
      load(); // reload for isDefault sync
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this measurement profile?')) return;
    try {
      await measurementsService.delete(id);
      setMeasurements(prev => prev.filter(m => m.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fields = MEASUREMENT_FIELDS[productType];

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Measurements</h1>
            <p className="text-stone-500 text-sm mt-1">Save your measurements for perfect bespoke fits</p>
          </div>
          <button
            onClick={openNew}
            className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-stone-700 transition-colors text-sm"
          >
            <FiPlus size={16} /> New Profile
          </button>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${typeFilter === '' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
          >
            All
          </button>
          {PRODUCT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-stone-200 rounded-xl animate-pulse" />)}
          </div>
        ) : measurements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FiTool size={50} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-600 font-semibold mb-1">No measurements yet</p>
            <p className="text-stone-400 text-sm mb-5">Save your measurements for faster ordering</p>
            <button onClick={openNew} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-700">
              Add Measurements
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {measurements.map(m => (
              <div key={m.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-5 flex items-start justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-stone-800">{m.name}</h3>
                        {m.isDefault && (
                          <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                            <FiStar size={10} /> Default
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[m.productType]}`}>
                          {m.productType}
                        </span>
                        <span className="text-xs text-stone-400">{m.unit}</span>
                      </div>
                      <p className="text-sm text-stone-400">
                        {Object.values(m.measurements).filter(v => v != null).length} measurements ·{' '}
                        {new Date(m.measuredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(m); }}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                    {expandedId === m.id ? <FiChevronUp size={16} className="text-stone-400" /> : <FiChevronDown size={16} className="text-stone-400" />}
                  </div>
                </div>

                {/* Expanded measurements grid */}
                {expandedId === m.id && (
                  <div className="px-5 pb-5 border-t border-stone-100 pt-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {MEASUREMENT_FIELDS[m.productType].map(({ key, label }) => (
                        m.measurements[key] != null && (
                          <div key={key} className="bg-stone-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-stone-400 mb-0.5">{label}</p>
                            <p className="font-bold text-stone-800 text-sm">{m.measurements[key]} <span className="font-normal text-stone-400 text-xs">{m.unit.toLowerCase()}</span></p>
                          </div>
                        )
                      ))}
                    </div>
                    {m.notes && (
                      <p className="text-sm text-stone-500 mt-3 italic">"{m.notes}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-stone-900">
                {editTarget ? 'Edit Measurements' : 'New Measurement Profile'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 text-xl leading-none">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name + Product type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Profile Name *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Work Suit, Casual Shirt"
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                {!editTarget && (
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Product Type *</label>
                    <select
                      value={productType}
                      onChange={e => handleTypeChange(e.target.value as ProductType)}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Unit + Default */}
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Unit</label>
                  <div className="flex rounded-lg border border-stone-300 overflow-hidden">
                    {(['CM', 'INCHES'] as MeasureUnit[]).map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={`px-5 py-2.5 text-sm font-medium transition-colors ${unit === u ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
                      >
                        {u === 'CM' ? 'cm' : 'inches'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={e => setIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-400"
                    />
                    <span className="text-sm font-semibold text-stone-700">Set as default for {productType.charAt(0) + productType.slice(1).toLowerCase()}</span>
                  </label>
                </div>
              </div>

              {/* Dynamic measurement fields */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-stone-700">Measurements</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[productType]}`}>{productType}</span>
                  <span className="text-xs text-stone-400">({unit.toLowerCase()})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fields.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={fieldValues[key] ?? ''}
                        onChange={e => setFieldValues(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Notes <span className="font-normal text-stone-400">(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional context for your tailor..."
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={2}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Save Measurements'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-semibold border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
