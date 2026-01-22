import { Box, CircularProgress } from "@mui/material";

const LoadingSpinner = ({ message = "Loading...", height = "50vh" , color = "#045071", gap = 0, loaderSize = 40}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={height}
      gap={gap}
    >
      <CircularProgress size={loaderSize} sx={{ color: color }} />
        <p style={{ margin: 0, color: "#666", fontSize: "14px", fontFamily: "Plus Jakarta Sans"}}>{message}</p>
    </Box>
  );
};

export default LoadingSpinner;