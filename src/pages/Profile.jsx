import { useState, useEffect, useContext } from "react";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { authFetch } = useContext(AppContext);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Yulita Cakes | Profil Admin";

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await authFetch("/admin/profile");

        if (!response.ok) {
          let errorData = { message: "Gagal mengambil data profil." };
          try {
            errorData = await response.json();
          } catch (e) {
            console.error("Failed to parse error JSON", e);
          }
          toast.error(errorData.message || "Gagal mengambil profil.");
          return;
        }

        const data = await response.json();
        setAdmin(data);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        if (error.message !== "Unauthorized") {
          toast.error("Terjadi kesalahan saat mengambil profil.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authFetch]);

  const handleProfileUpdate = (updatedAdminData) => {
    setAdmin(updatedAdminData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Gagal memuat data profil.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Profil Admin
      </h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Nama
          </label>
          <p className="text-lg text-gray-900">{admin.name}</p>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Email
          </label>
          <p className="text-lg text-gray-900">{admin.email}</p>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Tanggal Bergabung
          </label>
          <p className="text-lg text-gray-900">
            {admin.created_at
              ? new Date(admin.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="bg-pink-600 text-white px-5 py-2 rounded-md hover:bg-pink-700 transition duration-200 text-sm font-medium"
          >
            Edit Profil
          </button>
        </div>
      </div>

      {isEditModalOpen && admin && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentAdmin={admin}
          onProfileUpdated={handleProfileUpdate}
        />
      )}
    </div>
  );
};

Profile.propTypes = {};

export default Profile;
