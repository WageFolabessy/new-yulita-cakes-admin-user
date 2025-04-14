const customStyles = {
    table: {
        style: {
            backgroundColor: "#ffffff",
            borderRadius: "0.75rem",
            border: "3px solid lightgray",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
        },
    },
    header: {
        style: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            padding: "1rem",
            backgroundColor: "#f9fafb",
            color: "#111827",
        },
    },
    subHeader: {
        style: {
            backgroundColor: "transparant",
            padding: "1rem",
            marginBottom: "0.5rem",
            borderRadius: "0.5rem",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#fce7f3", // Pink-100 dari Tailwind
        },
    },
    headCells: {
        style: {
            fontSize: "0.875rem",
            fontWeight: "800",
            padding: "0.75rem 1rem",
            color: "#374151",
            textTransform: "uppercase",
        },
    },
    rows: {
        style: {
            backgroundColor: "#fdf2f8", // Pink-50 dari Tailwind untuk baris ganjil
            transition: "background 0.2s ease-in-out",
            "&:hover": {
                backgroundColor: "#f9fafb",
            },
        },
        stripedStyle: {
            backgroundColor: "#ffffff",
        },
    },
    cells: {
        style: {
            fontSize: "0.875rem",
            padding: "0.75rem 1rem",
            color: "#4b5563",
        },
    },
    pagination: {
        style: {
            backgroundColor: "#f9fafb",
            borderTop: "0",
            marginTop: "0.5rem",
            padding: "1rem",
            borderRadius: "0.75rem 0.75rem",
        },
        pageButtonsStyle: {
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            margin: "0 5px",
            transition: "all 0.3s",
            color: "#374151",
            "&:hover": {
                backgroundColor: "#e5e7eb",
            },
            "&.selected": {
                backgroundColor: "#374151",
                color: "#ffffff",
                fontWeight: "bold",
            },
        },
    },
    responsiveWrapper: {
        style: {
            borderRadius: "0.75rem",
        },
    },
};

export default customStyles;
