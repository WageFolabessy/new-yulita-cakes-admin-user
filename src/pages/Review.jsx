import { useState, useEffect, useMemo, useContext } from "react";
import DataTable from "react-data-table-component";
import { FaEye, FaTrash } from "react-icons/fa";
import ReviewDetailModal from "../components/Review/ReviewDetailModal";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import customStyles from "../mod/tableSyles";

const Review = () => {
  useEffect(() => {
    document.title = "Dashbor - Ulasan";
  }, []);

  const { authFetch } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Ambil data ulasan dari API admin
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await authFetch("/api/admin/reviews", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews);
        } else {
          toast.error("Gagal mengambil ulasan.");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Terjadi kesalahan saat mengambil ulasan.");
      }
    };

    fetchReviews();
  }, [authFetch]);

  const openDetailModal = (review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedReview(null);
    setIsDetailModalOpen(false);
  };

  // State untuk filter pencarian
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Filter data ulasan berdasarkan nama pengguna, produk, atau isi ulasan
  const filteredReviews = reviews.filter((review) => {
    const userName = review.user?.name || "";
    const productName = review.product?.product_name || "";
    const reviewContent = review.review || "";
    return (
      userName.toLowerCase().includes(filterText.toLowerCase()) ||
      productName.toLowerCase().includes(filterText.toLowerCase()) ||
      reviewContent.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  // Sub header untuk DataTable (filter pencarian)
  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <div className="flex flex-col sm:flex-row  items-center justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari Ulasan..."
          aria-label="Search Input"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full sm:w-72"
        />
        <button
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 w-full sm:w-auto"
        >
          Reset Pencarian
        </button>
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  // Kolom DataTable
  const columns = [
    {
      name: "No",
      cell: (row, index) => <div>{index + 1}</div>,
      width: "60px",
      center: true,
    },
    {
      name: "Nama Pengguna",
      selector: (row) => row.user?.name || "Unknown",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Produk",
      selector: (row) => row.product?.product_name || "Unknown",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Rating",
      selector: (row) => row.rating,
      sortable: true,
      cell: (row) => <div>{row.rating} / 5</div>,
      minWidth: "100px",
    },
    {
      name: "Tanggal",
      selector: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      },
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => openDetailModal(row)}
            className="text-lg text-green-500 hover:text-green-600 mx-1"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      center: true,
      minWidth: "100px",
    },
  ];



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ulasan Produk</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredReviews}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 15, 20, 50, 100]}
          paginationComponentOptions={{
            rowsPerPageText: "Baris per halaman:",
            rangeSeparatorText: "dari",
          }}
          responsive
          highlightOnHover
          striped
          customStyles={customStyles}
          subHeader
          subHeaderComponent={subHeaderComponent}
          paginationResetDefaultPage={resetPaginationToggle}
          noDataComponent={
            <div className="p-4 text-center text-gray-500">
              Tidak ada ulasan.
            </div>
          }
        />
      </div>

      {/* Modal Detail Ulasan */}
      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        review={selectedReview}
      />
    </div>
  );
};

export default Review;
