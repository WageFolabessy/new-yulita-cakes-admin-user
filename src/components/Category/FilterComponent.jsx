import PropTypes from "prop-types";

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center justify-start gap-3 w-full mb-4">
    <input
      id="search-category"
      type="text"
      placeholder="Cari Nama Kategori..."
      aria-label="Filter Kategori"
      value={filterText}
      onChange={onFilter}
      className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all w-full sm:w-auto sm:flex-grow placeholder-gray-500" // Style disesuaikan
    />
    <button
      type="button"
      onClick={onClear}
      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 w-full sm:w-auto text-sm font-medium" // Style disesuaikan
    >
      Reset
    </button>
  </div>
);

FilterComponent.propTypes = {
  filterText: PropTypes.string.isRequired,
  onFilter: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default FilterComponent;
