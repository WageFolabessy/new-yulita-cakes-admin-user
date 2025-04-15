import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import AddCategoryModal from "../components/Category/AddCategoryModal";
import EditCategoryModal from "../components/Category/EditCategoryModal";
import ViewCategoryModal from "../components/Category/ViewCategoryModal";
import DeleteCategoryModal from "../components/Category/DeleteCategoryModal";
import FilterComponent from "../components/Category/FilterComponent";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { authFetch } = useContext(AppContext);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/category");

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data kategori." };
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Failed to parse error JSON", e);
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }

      const result = await response.json();
      setCategories(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Kategori Produk";
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedCategory(null);
    setIsEditModalOpen(false);
  };
  const openViewModal = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedCategory(null);
    setIsViewModalOpen(false);
  };
  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedCategory(null);
    setIsDeleteModalOpen(false);
  };

  const handleCategoryAdded = useCallback((newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    toast.success("Kategori baru berhasil ditambahkan.");
  }, []);

  const handleCategoryUpdated = useCallback((updatedCategory) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    toast.success("Kategori berhasil diperbarui.");
  }, []);

  const handleCategoryDeleted = useCallback((deletedCategoryId) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== deletedCategoryId));
    toast.success("Kategori berhasil dihapus.");
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          item.category_name &&
          item.category_name.toLowerCase().includes(filterText.toLowerCase())
      ),
    [categories, filterText]
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
        name: "Gambar",
        cell: (row) =>
          row.image_url ? (
            <img
              src={row.image_url}
              alt={row.category_name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 shadow-sm my-1"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-xs">
              No Img
            </div>
          ),
        width: "120px",
        center: true,
      },
      {
        name: "Nama Kategori",
        selector: (row) => row.category_name,
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Tanggal Dibuat",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) =>
          row.created_at
            ? new Date(row.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        minWidth: "130px",
      },
      {
        name: "Tanggal Diperbaharui",
        selector: (row) => row.updated_at,
        sortable: true,
        cell: (row) =>
          row.updated_at
            ? new Date(row.updated_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        minWidth: "130px",
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
    ],
    []
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Kategori Produk
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm hover:shadow-lg text-sm font-medium"
        >
          <FaPlus className="mr-2" />
          Tambah Kategori
        </button>
      </div>

      {/* Container Tabel */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredCategories}
          progressPending={loadingCategories}
          progressComponent={
            <div className="py-6 text-center text-gray-500">Memuat data...</div>
          }
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
                : "Belum ada data kategori."}
            </div>
          }
        />
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onCategoryAdded={handleCategoryAdded}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        category={selectedCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />
      <ViewCategoryModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        category={selectedCategory}
      />
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        category={selectedCategory}
        onCategoryDeleted={handleCategoryDeleted}
      />
    </div>
  );
};

Category.propTypes = {};

export default Category;
