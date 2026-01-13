import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Weight, DollarSign, Truck } from 'lucide-react';

const PackageOrderSystem = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.size === 0) {
      setError('Please select at least one item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = Array.from(selectedItems);
      
      const response = await fetch(`${API_BASE}/orders/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: orderItems })
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data.packages);
      } else {
        setError(data.error || 'Failed to process order');
      }
    } catch (err) {
      setError('Failed to process order');
      console.error('Error processing order:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPackages = () => {
    if (!packages) return null;

    return (
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6" />
          This order has {packages.length} package{packages.length !== 1 ? 's' : ''}
        </h2>
        
        {packages.map((pkg, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Package {idx + 1}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <span className="font-medium text-gray-700">Items: </span>
                  <span className="text-gray-600">
                    {pkg.items.join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Total weight: </span>
                <span className="text-gray-600">{pkg.totalWeight}g</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Total price: </span>
                <span className="text-gray-600">${Number(pkg.totalPrice).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Courier price: </span>
                <span className="text-green-600 font-semibold">${pkg.courierPrice}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">Total Courier Charges:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${packages.reduce((sum, pkg) => sum + Number(pkg.courierPrice), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Package Order System
          </h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Available Items
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {items.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-4">No items available</p>
              )}
              {loading && items.length === 0 && (
                <p className="text-gray-500 text-center py-4">Loading items...</p>
              )}
              {items.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="flex-1 text-gray-700">
                    <span className="font-medium">{item.name}</span>
                    {' - '}
                    <span className="text-green-600">${item.price}</span>
                    {' - '}
                    <span className="text-gray-500">{item.weight}g</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={loading || selectedItems.size === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Place Order ({selectedItems.size} items)
              </>
            )}
          </button>
          
          {renderPackages()}
        </div>
      </div>
    </div>
  );
};

export default PackageOrderSystem;