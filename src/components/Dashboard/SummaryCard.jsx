const SummaryCard = ({ title, value, icon, className }) => {
  return (
    <div className={`p-6 rounded-3xl flex items-center gap-4 ${className}`}>
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};


export default SummaryCard;