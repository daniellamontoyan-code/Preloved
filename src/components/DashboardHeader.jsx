export default function DashboardHeader({ nombre }) {
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "U";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "14px",
            color: "#8B8B99",
            margin: 0,
            marginBottom: "6px",
            fontWeight: "500",
          }}
        >
          Bienvenida de nuevo ✨
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: "700",
            color: "#1F1F28",
          }}
        >
          {nombre}
        </h1>
      </div>

      <div
        style={{
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "#EFE8FF",
          color: "#C0003B",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "700",
          fontSize: "22px",
        }}
      >
        {inicial}
      </div>
    </div>
  );
}