import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify'; // Import toast

import AddAdminModal from "../components/Admin/AddAdminModal";
import EditAdminModal from "../components/Admin/EditAdminModal";
import ViewAdminModal from "../components/Admin/ViewAdminModal";
import DeleteAdminModal from "../components/Admin/DeleteAdminModal";
import FilterComponent from "../components/Admin/FilterComponent";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const { authFetch } = useContext(AppContext);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/admin");

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data admin." };
        try {
          errorData = await response.json();
        } catch (e) { console.error("Failed to parse error JSON", e); }
        throw new Error(errorData.message || "Gagal memuat data.");
      }

      const result = await response.json();
      setAdmins(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching admins:", error);
       if (error.message !== 'Unauthorized') {
           toast.error(`Error: ${error.message}`);
           setFetchError(error.message);
       }
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Kelola Admin";
    fetchAdmins();
  }, [fetchAdmins]);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (admin) => { setSelectedAdmin(admin); setIsEditModalOpen(true); };
  const closeEditModal = () => { setSelectedAdmin(null); setIsEditModalOpen(false); };
  const openViewModal = (admin) => { setSelectedAdmin(admin); setIsViewModalOpen(true); };
  const closeViewModal = () => { setSelectedAdmin(null); setIsViewModalOpen(false); };
  const openDeleteModal = (admin) => { setSelectedAdmin(admin); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setSelectedAdmin(null); setIsDeleteModalOpen(false); };

  const handleAdminAdded = useCallback((newAdmin) => {
    setAdmins((prevAdmins) => [newAdmin, ...prevAdmins]);
    toast.success("Admin baru berhasil ditambahkan.");
  }, []);

  const handleAdminUpdated = useCallback((updatedAdmin) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) =>
        admin.id === updatedAdmin.id ? updatedAdmin : admin
      )
    );
    toast.success("Data admin berhasil diperbarui.");
  }, []);

  const handleAdminDeleted = useCallback((deletedAdminId) => {
    setAdmins((prevAdmins) =>
      prevAdmins.filter((admin) => admin.id !== deletedAdminId)
    );
    toast.success("Admin berhasil dihapus.");
  }, []);


  const filteredAdmins = useMemo(() => admins.filter(
    (admin) =>
      (admin.name && admin.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (admin.email && admin.email.toLowerCase().includes(filterText.toLowerCase()))
  ), [admins, filterText]);

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

  const columns = useMemo(() => [
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
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "220px",
    },
    {
      name: "Tanggal Dibuat",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => row.created_at ? new Date(row.created_at).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }) : '-',
      minWidth: "170px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => openViewModal(row)}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Hapus"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
      minWidth: "120px",
    },
  ], [openViewModal, openEditModal, openDeleteModal]);


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Kelola Admin
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm hover:shadow-lg text-sm font-medium"
        >
          <FaPlus className="mr-2" />
          Tambah Admin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
            columns={columns}
            data={filteredAdmins}
            progressPending={loadingAdmins}
            progressComponent={<div className="p-4 text-center text-gray-500">Memuat data...</div>}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 15, 20, 50]}
            paginationComponentOptions={{
              rowsPerPageText: "Baris per halaman:",
              rangeSeparatorText: "dari",
            }}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            responsive
            highlightOnHover
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="p-6 text-center text-gray-500">
                 {fetchError ? `Gagal memuat data: ${fetchError}` : 'Tidak ada data admin untuk ditampilkan.'}
              </div>
            }
         />
      </div>

      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdminAdded={handleAdminAdded}
      />
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        admin={selectedAdmin}
        onAdminUpdated={handleAdminUpdated}
      />
      <ViewAdminModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        admin={selectedAdmin}
      />
      <DeleteAdminModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        admin={selectedAdmin}
        onAdminDeleted={handleAdminDeleted}
      />
    </div>
  );
};

Admin.propTypes = {};


export default Admin;