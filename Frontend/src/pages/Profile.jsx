import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";

const Profile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Profile Information</h1>
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            <Edit size={20} />
                            <span>Edit Profile</span>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="text-lg font-medium">{user?.username || 'N/A'}</p>
                        </div>

                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-lg font-medium">{user?.email || 'N/A'}</p>
                        </div>

                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="text-lg font-medium capitalize">{user?.role || 'N/A'}</p>
                        </div>

                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="text-lg font-medium">{user?.age || 'N/A'}</p>
                        </div>

                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-lg font-medium capitalize">{user?.gender || 'N/A'}</p>
                        </div>

                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="text-lg font-medium">{user?.contact || 'N/A'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Account Balance</p>
                            <p className="text-lg font-medium text-green-600">
                                ₹{parseFloat(user?.account_balance || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;