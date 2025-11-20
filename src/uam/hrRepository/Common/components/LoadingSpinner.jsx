import { Box, CircularProgress } from "@mui/material";

const LoadingSpinner = ({ message = "Loading...", height = "50vh" }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={height}
      gap={2}
    >
      <CircularProgress size={40} sx={{ color: "#045071" }}/>
      <p style={{ margin: 0, color: "#666", fontSize: "14px", fontFamily: "Plus Jakarta Sans"}}>{message}</p>
    </Box>
  );
};

export default LoadingSpinner;