import CircularProgress from "@mui/material/CircularProgress";

const MiniLoader = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    padding: "16px 0"
  }}>
    <CircularProgress size={40} sx={{ color: "#045071" }} />
  </div>
);

export default MiniLoader;
