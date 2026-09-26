import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Layers,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Bed,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { ownerAPI, propertyAPI } from '../services/api';
import ExcelUploadModal from '../components/ExcelUploadModal';

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [addUnitTargetProp, setAddUnitTargetProp] = useState(null);

  // New Property Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('banquet_hall');
  const [newCategory, setNewCategory] = useState('venue');
  const [newDescription, setNewDescription] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Janakpur');
  const [newBasePrice, setNewBasePrice] = useState(60000);
  const [newMaxCapacity, setNewMaxCapacity] = useState(350);
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Unit Form state
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState('banquet_hall');
  const [unitCapacity, setUnitCapacity] = useState(250);
  const [unitPrice, setUnitPrice] = useState(50000);
  const [unitPriceType, setUnitPriceType] = useState('per_day');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getProperties();
      if (res.success) {
        setProperties(res.properties || []);
      }
    } catch (err) {
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await propertyAPI.create({
        title: newTitle,
        propertyType: newType,
        category: newCategory,
        description: newDescription,
        address: newAddress,
        city: newCity,
        basePrice: Number(newBasePrice),
        maxCapacity: Number(newMaxCapacity),
        images: [newImage],
        amenities: ['Central AC', 'Bridal Room', 'Ample Parking', 'Power Backup', 'In-house Catering Setup'],
        suitableFor: ['Wedding', 'Reception', 'Birthday Party', 'Corporate Meeting']
      });

      if (res.success) {
        setAddPropertyOpen(false);
        fetchProperties();
      }
    } catch (err) {
      alert(err.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!addUnitTargetProp) return;
    setIsSubmitting(true);
    try {
      const res = await propertyAPI.addUnit(addUnitTargetProp._id, {
        name: unitName,
        unitType,
        capacity: Number(unitCapacity),
        pricePerUnit: Number(unitPrice),
        priceType: unitPriceType,
        amenities: ['AC', 'Wi-Fi']
      });

      if (res.success) {
        setAddUnitTargetProp(null);
        setUnitName('');
        fetchProperties();
      }
    } catch (err) {
      alert(err.message || 'Failed to add unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600">
            Property & Hall Inventory
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Venues & Accommodations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your hotels, banquet halls, lawn spaces, and guest rooms
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-2xl shadow-sm transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import Excel/CSV</span>
          </button>
          <button
            onClick={() => setAddPropertyOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No properties listed yet</h3>
          <button
            onClick={() => setAddPropertyOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Add Your First Venue
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {properties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
            >
              {/* Property Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  <img
                    src={prop.images?.[0]}
                    alt={prop.title}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 capitalize">
                        {prop.propertyType}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Active
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{prop.title}</h3>
                    <p className="text-xs text-slate-500">
                      {prop.address}, {prop.city} • Up to {prop.maxCapacity} Guests
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setAddUnitTargetProp(prop)}
                    className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room / Hall Unit</span>
                  </button>
                </div>
              </div>

              {/* Sub-Units List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Halls & Rooms ({prop.units?.length || 0})
                </h4>

                {prop.units?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No halls or rooms added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {prop.units?.map((unit) => (
                      <div
                        key={unit._id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{unit.name}</span>
                          <span className="text-[10px] font-bold capitalize text-slate-500">
                            {unit.unitType}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Capacity: {unit.capacity}</span>
                          <span className="font-extrabold text-slate-900">
                            {formatPrice(unit.pricePerUnit)} / {unit.priceType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Property */}
      {addPropertyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold text-slate-900">List New Venue or Hotel</h3>
              <button onClick={() => setAddPropertyOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Grand Palace & Lawn"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Property Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="banquet_hall">Banquet Hall</option>
                    <option value="palace">Wedding Palace</option>
                    <option value="resort">Resort & Lawn</option>
                    <option value="hotel">Hotel</option>
                    <option value="conference_center">Conference Center</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="venue">Event Venue Only</option>
                    <option value="hotel">Hotel Accommodation Only</option>
                    <option value="both">Both (Venue + Hotel Rooms)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe your venue, atmosphere, and amenities..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. Station Road"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Base Price / Day (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Max Guest Capacity</label>
                  <input
                    type="number"
                    required
                    value={newMaxCapacity}
                    onChange={(e) => setNewMaxCapacity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddPropertyOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow"
                >
                  {isSubmitting ? 'Saving...' : 'List Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Unit (Room / Hall) */}
      {addUnitTargetProp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Add Hall or Room to {addUnitTargetProp.title}
              </h3>
              <button onClick={() => setAddUnitTargetProp(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Unit / Hall Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lotus Grand Hall, Deluxe AC Room"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Type</label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="banquet_hall">Banquet Hall</option>
                    <option value="lawn">Open Lawn</option>
                    <option value="room">Hotel Room</option>
                    <option value="suite">Bridal Suite</option>
                    <option value="conference_room">Conference Room</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Guest Capacity</label>
                  <input
                    type="number"
                    required
                    value={unitCapacity}
                    onChange={(e) => setUnitCapacity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price Rate</label>
                  <select
                    value={unitPriceType}
                    onChange={(e) => setUnitPriceType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="per_day">Per Day</option>
                    <option value="per_night">Per Night</option>
                    <option value="per_event">Per Event</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddUnitTargetProp(null)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow"
                >
                  {isSubmitting ? 'Adding...' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel / CSV Upload Modal */}
      <ExcelUploadModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={() => {
          fetchProperties();
        }}
      />
    </div>
  );
}
