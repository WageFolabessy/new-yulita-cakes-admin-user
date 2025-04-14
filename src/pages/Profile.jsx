import { useState, useEffect, useContext } from "react";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { authFetch } = useContext(AppContext);
  const [admin, setAdmin] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Dasbor - Profil";

    const fetchProfile = async () => {
      try {
        const response = await authFetch("/api/admin/get_admin");
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Gagal mengambil profil.");
          return;
        }
        const data = await response.json();
        setAdmin(data);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        toast.error("Terjadi kesalahan jaringan.");
      }
    };

    fetchProfile();
  }, [authFetch]);

  // Fungsi untuk memperbarui data profil (jika terjadi update dari modal)
  const updateProfile = (id, updatedData) => {
    if (admin && admin.id === id) {
      setAdmin({ ...admin, ...updatedData });
    }
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profil Admin</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Nama:
          </label>
          <p className="text-lg text-gray-900">{admin.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <p className="text-lg text-gray-900">{admin.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Dibuat:
          </label>
          <p className="text-lg text-gray-900">
            {new Date(admin.created_at).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Edit Profil
          </button>
        </div>
      </div>
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          admin={admin}
          updateProfile={updateProfile}
        />
      )}
    </div>
  );
};

export default Profile;
