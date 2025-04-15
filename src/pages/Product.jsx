import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import AddProductModal from "../components/Product/AddProductModal";
import EditProductModal from "../components/Product/EditProductModal";
import ViewProductModal from "../components/Product/ViewProductModal";
import DeleteProductModal from "../components/Product/DeleteProductModal";
import FilterComponent from "../components/Product/FilterComponent";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { authFetch } = useContext(AppContext);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/product");

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data produk." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* abaikan */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }

      const result = await response.json();
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Produk";
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedProduct(null);
    setIsViewModalOpen(false);
  };
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedProduct(null);
    setIsDeleteModalOpen(false);
  };

  const handleProductAdded = useCallback((newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    toast.success("Produk baru berhasil ditambahkan.");
  }, []);

  const handleProductUpdated = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === updatedProduct.id ? updatedProduct : prod
      )
    );
    toast.success("Produk berhasil diperbarui.");
  }, []);

  const handleProductDeleted = useCallback((deletedProductId) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== deletedProductId));
    toast.success("Produk berhasil dihapus.");
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (product.product_name &&
            product.product_name
              .toLowerCase()
              .includes(filterText.toLowerCase())) ||
          (product.category?.category_name &&
            product.category.category_name
              .toLowerCase()
              .includes(filterText.toLowerCase()))
      ),
    [products, filterText]
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

  const formatRupiah = (number) => {
    if (number === null || number === undefined) return "-";
    return `Rp ${Number(number).toLocaleString("id-ID")}`;
  };

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
        cell: (row) => {
          const primaryImage = row.images?.find((img) => img.is_primary);
          const imageUrl =
            primaryImage?.image_url || row.images?.[0]?.image_url;

          return imageUrl ? (
            <img
              src={imageUrl}
              alt={row.product_name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 shadow-sm my-1"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-xs">
              No Img
            </div>
          );
        },
        width: "120px",
        center: true,
      },
      {
        name: "Nama Produk",
        selector: (row) => row.product_name,
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Kategori",
        selector: (row) => row.category?.category_name || "-",
        sortable: true,
        wrap: true,
        minWidth: "100px",
      },
      {
        name: "Harga Original",
        selector: (row) => row.original_price,
        sortable: true,
        cell: (row) => formatRupiah(row.original_price),
        right: true,
        minWidth: "200px",
      },
      {
        name: "Harga Diskon",
        selector: (row) => row.sale_price,
        sortable: true,
        cell: (row) => formatRupiah(row.sale_price),
        right: true,
        minWidth: "200px",
      },
      {
        name: "Stok",
        selector: (row) => row.stock,
        sortable: true,
        center: true,
        width: "100px",
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
          Kelola Produk
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm hover:shadow-lg text-sm font-medium"
        >
          <FaPlus className="mr-2" />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredProducts}
          progressPending={loadingProducts}
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
                : "Belum ada data produk."}
            </div>
          }
        />
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onProductAdded={handleProductAdded}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        product={selectedProduct}
      />
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        product={selectedProduct}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

Product.propTypes = {};

export default Product;
