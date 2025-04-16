import {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from "react";
import DataTable from "react-data-table-component";
import { FaEye, FaBan, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

import UserDetailModal from "../components/User/UserDetailModal";
import FilterComponent from "../components/User/FilterComponent";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const User = () => {
  const { authFetch } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUser(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/site_user", { method: "GET" });

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data pengguna." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }

      const result = await response.json();
      setUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setUsers([]);
    } finally {
      setLoadingUser(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Pengguna";
    fetchUsers();
  }, [fetchUsers]);

  const openDetailModal = useCallback((user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  }, []);

  const toggleUserStatus = useCallback(
    async (userId, currentStatus) => {
      try {
        const newStatus = !currentStatus;
        const response = await authFetch(
          `/admin/update_siteuser_status/${userId}`,
          {
            method: "PUT",
            body: JSON.stringify({ is_active: newStatus }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.message || "Gagal mengupdate status pengguna.");
          return;
        }

        setUsers((prevUsers) =>
          prevUsers.map(
            (user) => (user.id === userId ? result.user : user) 
          )
        );
        toast.success(result.message || "Status akun berhasil diperbarui.");
      } catch (error) {
        console.error("Error updating user status:", error);
        if (error.message !== "Unauthorized") {
          toast.error("Terjadi kesalahan jaringan saat update status.");
        }
      }
    },
    [authFetch]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(filterText.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [users, filterText]
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  // Format Tanggal helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "-";
    }
  };

  // -- DataTable Columns --
  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "60px",
        center: true,
      },
      {
        name: "Nama",
        selector: (row) => row.name,
        sortable: true,
        minWidth: "180px",
        wrap: true,
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        minWidth: "220px",
      },
      {
        name: "Tanggal Daftar",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => formatDate(row.created_at),
        minWidth: "170px",
        wrap: true,
      },
      {
        name: "Status",
        sortable: true,
        minWidth: "110px",
        center: true,
        selector: (row) => row.is_active,
        cell: (row) =>
          row.is_active ? (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Aktif
            </span>
          ) : (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
              Non-Aktif
            </span>
          ),
      },
      {
        name: "Aksi",
        center: true,
        minWidth: "100px",
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        cell: (row) => (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => openDetailModal(row)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Lihat Detail"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleUserStatus(row.id, row.is_active)}
              className={`p-1.5 rounded-md transition-colors ${
                row.is_active
                  ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              title={row.is_active ? "Nonaktifkan" : "Aktifkan"}
            >
              {row.is_active ? (
                <FaBan className="w-4 h-4" />
              ) : (
                <FaCheck className="w-4 h-4" />
              )}
            </button>
          </div>
        ),
      },
    ],
    [openDetailModal, toggleUserStatus]
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Pengguna Terdaftar
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredUsers}
          progressPending={loadingUser}
          progressComponent={
            <div className="py-6 text-center text-gray-500">Memuat data...</div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 15, 20, 50]}
          paginationComponentOptions={{
            rowsPerPageText: "Baris:",
            rangeSeparatorText: "dari",
          }}
          paginationResetDefaultPage={resetPaginationToggle}
          subHeader
          subHeaderComponent={subHeaderComponent}
          subHeaderAlign="left"
          persistTableHead
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
          noDataComponent={
            <div className="p-6 text-center text-gray-500">
              {fetchError
                ? `Gagal memuat data: ${fetchError}`
                : "Belum ada data pengguna."}
            </div>
          }
        />
      </div>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
      />
    </div>
  );
};

User.propTypes = {};

export default User;
