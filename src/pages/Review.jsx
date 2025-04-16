import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

import ReviewDetailModal from "../components/Review/ReviewDetailModal";
import FilterComponent from "../components/Review/FilterComponent";

import { AppContext } from "../context/AppContext";
import customStyles from "../mod/tableSyles";

const Review = () => {
  const { authFetch } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    setFetchError(null);
    try {
      const response = await authFetch("/admin/reviews"); // Path relatif

      if (!response.ok) {
        let errorData = { message: "Gagal memuat data ulasan." };
        try {
          errorData = await response.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorData.message || "Gagal memuat data.");
      }
      const result = await response.json();
      setReviews(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (error.message !== "Unauthorized") {
        toast.error(`Error: ${error.message}`);
        setFetchError(error.message);
      }
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [authFetch]);

  useEffect(() => {
    document.title = "Yulita Cakes | Ulasan Produk";
    fetchReviews();
  }, [fetchReviews]);

  const openDetailModal = useCallback((review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedReview(null);
    setIsDetailModalOpen(false);
  }, []);

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const searchTerm = filterText.toLowerCase();
        const userName = review.user?.name?.toLowerCase() || "";
        const productName = review.product?.product_name?.toLowerCase() || "";
        const reviewContent = review.review?.toLowerCase() || "";
        return (
          userName.includes(searchTerm) ||
          productName.includes(searchTerm) ||
          reviewContent.includes(searchTerm)
        );
      }),
    [reviews, filterText]
  );

  // -- Sub Header (Filter) --
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

  // -- Helper Format --
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const RatingStars = ({ rating }) => {
    const totalStars = 5;
    const filledStars = Math.max(0, Math.min(totalStars, rating || 0));
    return (
      <div className="flex items-center text-yellow-400 text">
        {[...Array(filledStars)].map((_, i) => (
          <span key={`f-${i}`}>★</span>
        ))}
        {[...Array(totalStars - filledStars)].map((_, i) => (
          <span key={`e-${i}`} className="text-gray-300">
            ☆
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating || 0})</span>
      </div>
    );
  };
  RatingStars.propTypes = { rating: PropTypes.number };

  const columns = useMemo(
    () => [
      {
        name: "No",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "50px",
        center: true,
      },
      {
        name: "Pengguna",
        selector: (row) => row.user?.name || "-",
        sortable: true,
        wrap: true,
        minWidth: "150px",
      },
      {
        name: "Produk",
        selector: (row) => row.product?.product_name || "-",
        sortable: true,
        wrap: true,
        minWidth: "200px",
      },
      {
        name: "Rating",
        selector: (row) => row.rating,
        sortable: true,
        cell: (row) => <RatingStars rating={row.rating} />,
        center: true,
        width: "120px",
      },
      {
        name: "Ulasan",
        selector: (row) => row.review,
        sortable: false,
        cell: (row) => (
          <p className="text-xs truncate w-full" title={row.review}>
            {row.review || "-"}
          </p>
        ),
        minWidth: "250px",
      },
      {
        name: "Tanggal",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => formatDate(row.created_at),
        minWidth: "160px",
        wrap: true,
      },
      {
        name: "Aksi",
        center: true,
        width: "70px",
        cell: (row) => (
          <button
            onClick={() => openDetailModal(row)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [openDetailModal]
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Ulasan Produk
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={filteredReviews}
          progressPending={loadingReviews}
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
                : "Belum ada data ulasan."}
            </div>
          }
        />
      </div>

      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        review={selectedReview}
      />
    </div>
  );
};

Review.propTypes = {};

export default Review;
