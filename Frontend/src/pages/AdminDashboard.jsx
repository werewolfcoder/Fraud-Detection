import React from "react";

const AdminDashboard = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-sky-300 to-cyan-950 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Alerts & Notifications Section */}
      <div className="relative bg-orange-100 shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold text-orange-700 mb-4">Alerts & Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium text-gray-700">Fraud Alerts</h3>
            <ul className="mt-2 space-y-2">
              <li className="p-3 bg-orange-50 rounded-lg">
                <p className="font-semibold text-gray-800">High-Risk Transaction Detected</p>
                <p className="text-sm text-orange-600">Transaction #12345</p>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium text-gray-700">Large Withdrawal Alerts</h3>
            <ul className="mt-2 space-y-2">
              <li className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-semibold text-gray-800">Large Withdrawal Detected</p>
                <p className="text-sm text-yellow-600">Amount: $50,000</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fraud Detection & Monitoring Section */}
        <div className="relative bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Fraud Detection & Monitoring</h2>
          <h3 className="text-lg font-medium text-gray-700">Fraud Alerts Panel</h3>
          <ul className="mt-2 space-y-2">
            <li className="p-3 bg-red-50 rounded-lg">
              <p className="font-semibold text-gray-800">Transaction #12345</p>
              <p className="text-sm text-red-600">High Risk</p>
            </li>
            <li className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-semibold text-gray-800">Transaction #67890</p>
              <p className="text-sm text-yellow-600">Medium Risk</p>
            </li>
          </ul>
          <div className="border-t mt-4 pt-4">
            <h3 className="text-lg font-medium text-gray-700">Fraud Risk Score</h3>
            <ul className="mt-2 space-y-2">
              <li className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold text-gray-800">Transaction #12345</p>
                <p className="text-sm text-red-600">Score: High</p>
              </li>
              <li className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-semibold text-gray-800">Transaction #67890</p>
                <p className="text-sm text-yellow-600">Score: Medium</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Customer & Account Management */}
        <div className="relative bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Customer & Account Management</h2>
          <h3 className="text-lg font-medium text-gray-700">User List & Status</h3>
          <ul className="mt-2 space-y-2">
            <li className="p-3 bg-green-50 rounded-lg">
              <p className="font-semibold text-gray-800">John Doe</p>
              <p className="text-sm text-green-600">Status: Active</p>
            </li>
            <li className="p-3 bg-red-50 rounded-lg">
              <p className="font-semibold text-gray-800">Jane Smith</p>
              <p className="text-sm text-red-600">Status: Suspended</p>
            </li>
          </ul>
          <div className="border-t mt-4 pt-4">
            <h3 className="text-lg font-medium text-gray-700">Customer Risk Score</h3>
            <ul className="mt-2 space-y-2">
              <li className="p-3 bg-green-50 rounded-lg">
                <p className="font-semibold text-gray-800">John Doe</p>
                <p className="text-sm text-green-600">Risk Score: Low</p>
              </li>
              <li className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold text-gray-800">Jane Smith</p>
                <p className="text-sm text-red-600">Risk Score: High</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Financial Insights & Reports */}
        <div className="relative bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Financial Insights & Reports</h2>
          <h3 className="text-lg font-medium text-gray-700">Daily/Monthly Revenue Report</h3>
          <p className="mt-2 text-gray-800">Revenue: <span className="font-semibold">$10,000</span> (Today)</p>
          <p className="text-gray-800">Revenue: <span className="font-semibold">$300,000</span> (This Month)</p>
          <div className="border-t mt-4 pt-4">
            <h3 className="text-lg font-medium text-gray-700">Most Active Users & Merchants</h3>
            <ul className="mt-2 space-y-2">
              <li className="p-3 bg-purple-50 rounded-lg">
                <p className="font-semibold text-gray-800">User: John Doe</p>
                <p className="text-sm text-purple-600">100 Transactions</p>
              </li>
              <li className="p-3 bg-purple-50 rounded-lg">
                <p className="font-semibold text-gray-800">Merchant: ABC Store</p>
                <p className="text-sm text-purple-600">500 Transactions</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Security & Compliance</h2>
          <h3 className="text-lg font-medium text-gray-700">System Logs & Activity Monitoring</h3>
          <ul className="mt-2 space-y-2">
            <li className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">Admin Login</p>
              <p className="text-sm text-gray-600">Timestamp: 2025-03-30 10:00 AM</p>
            </li>
            <li className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">Permission Change</p>
              <p className="text-sm text-gray-600">Timestamp: 2025-03-30 11:00 AM</p>
            </li>
          </ul>
          <div className="border-t mt-4 pt-4">
            <h3 className="text-lg font-medium text-gray-700">Access Control Management</h3>
            <p className="text-gray-800">Manage roles and permissions for admins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;