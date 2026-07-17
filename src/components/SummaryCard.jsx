export default function SummaryCard({ value, title }) {
  return (
    <div
      style={{
        background:"#FFFFFF",
        borderRadius:"24px",
        padding:"24px",
        minHeight:"130px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        boxShadow:"0 10px 30px rgba(0,0,0,.05)",
        textAlign:"center",
      }}
    >

      <h2
        style={{
          margin:0,
          fontSize:"38px",
          lineHeight:"1",
          fontWeight:"700",
          color:"#1F1F28",
        }}
      >
        {value}
      </h2>


      <p
        style={{
          margin:0,
          marginTop:"12px",
          fontSize:"16px",
          color:"#7B7B88",
          fontWeight:"500",
        }}
      >
        {title}
      </p>


    </div>
  );
}