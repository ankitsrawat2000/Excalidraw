"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { Plus, Users, Calendar, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAdminId } from "@/utils/auth"; // path where you put that helper

interface Room {
  id: number;
  slug: string;
  createdAt: string;
  admin: {
    name: string;
  };
}

export function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const id = getAdminId();
    if (!id) {
      router.push("/signin");
      return;
    }
    setAdminId(id);
    fetchRooms(id);
  }, []);

  const fetchRooms = async (adminId: string) => {
    try {
      const res = await axios.get(`${HTTP_BACKEND}/api/v1/rooms/${adminId}`);
      setRooms(res.data.rooms);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || creating || !adminId) return;

    setCreating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${HTTP_BACKEND}/api/v1/room`,
        { name: newRoomName },
        {
          headers: {
            Authorization: token || "",
          },
        }
      );

      await fetchRooms(adminId); // ✅ FIXED: pass adminId
      setNewRoomName("");
      setShowCreateModal(false);

      // Navigate to the new room’s page
      router.push(`/canvas/${newRoomName}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = (slug: string) => {
    router.push(`/canvas/${slug}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rooms</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="h-5 w-5" />
              Create Room
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No rooms yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6"
                onClick={() => joinRoom(room.slug)}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {room.slug}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  Admin: {room.admin.name}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(room.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
            <input
              type="text"
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") createRoom();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={createRoom}
                disabled={creating || !newRoomName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoomName("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

