import { ChevronRight } from "lucide-react";

export default function SectionTitle({
  title,
  action = "Ver todo",
  onClick,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#383B3B",
        }}
      >
        {title}
      </h2>

      <button
        onClick={onClick}
        style={{
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "#8B1E2D",
          fontWeight: "600",
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        {action}

        <ChevronRight size={18} />
      </button>
    </div>
  );
}