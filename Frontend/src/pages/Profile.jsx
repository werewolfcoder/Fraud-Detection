import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
            </div>
        </div>
    );
};

export default Profile;