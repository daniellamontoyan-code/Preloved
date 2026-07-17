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
          color: "#1F1F28",
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
          color: "#7C5CFC",
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