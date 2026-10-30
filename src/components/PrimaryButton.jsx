export default function PrimaryButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: "64px",
        border: "none",
        borderRadius: "22px",
        background: "#8B1E2D",
        color: "white",
        fontSize: "20px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 12px 30px rgba(124,92,252,.25)",
        transition: "all .2s ease",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>

      {text}
    </button>
  );
}