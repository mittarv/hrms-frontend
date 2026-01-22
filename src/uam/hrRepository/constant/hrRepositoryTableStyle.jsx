// HR Repository Table Style Constants
// Separated from main constant/tableStyle.jsx to enable HR Repository to act as a separate repository

import { styled } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { Tooltip, tooltipClasses } from "@mui/material";

export const hrRepositoryTableStyle = {
  StyledTableRow: styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: "#F9F9FB",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  })),

  StyledTableCell: styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "#F9F9FB",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  })),

  ToolTip1: styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: "#033348",
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#033348",
      color: "#FFFFFF",
      fontSize: "12px",
      fontWeight: "600",
      padding: "10px",

    },
  })),

  TableStyle: {
    width: "90%",
    marginTop: "30px",
    marginLeft: "40px",
    border: "none",
    '&::WebkitScrollbar': {
      height: '0.4em'
    },
  },
  TableStylePendingReq: {
    width: "90%",
    // marginTop: "30px",
    marginLeft: "40px",
    border: "none",
    '&::WebkitScrollbar': {
      height: '0.4em'
    },
  },

  TableHeaderStyle: {
    color: "#033348",
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: "23px",
    letterSpacing: "0px",
    // paddingLeft:'20px'
    // fontFamily: 'Plus Jakarta Sans'
  },

  ToolNameStyle: {
    fontSize: "16px",
    color: "#033348",
    fontWeight: "400",
    // width:'200px !important',
  },

  ToolNameStylePadded: {
    //required for some schenarios where padding is required but in some specific conditions
    fontSize: "16px",
    color: "#033348",
    fontWeight: "400",
    display: "flex",
    alignItems: "center",
    paddingLeft: "50px",
  },

  TooldetailStyle: {
    width: "25%",
    fontSize: "16px",
    color: "#525252",
    fontWeight: "400",
  },
  ToolTipStyle: {
    color: "#FFFFFF",
    backgroundColor: "#033348",
  },
  KnownIssueStyle:{
    fontSize: '16px',
    color: '#033348',
    fontWeight: '400',
    whiteSpace: 'normal',
    wordWrap:'break-word',
    maxWidth:'200px'
  },
  LanguageTextEditorStyle:{
    fontSize: '16px',
    color: '#033348',
    fontWeight: '400',
    whiteSpace: 'normal',
    wordWrap:'break-word',
    maxWidth:'200px'
  },
  
  AppVersionControlStyle:{
    fontSize: '16px',
    color: '#033348',
    fontWeight: '400',
    whiteSpace: 'normal',
    wordWrap:'break-word',
    maxWidth:'200px'
  },
  MyUpdateStyle:{
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '14px',
    color: '#033348',
    fontWeight: '400',
    whiteSpace: 'normal',
    wordWrap:'break-word',
    maxWidth:'200px',
  }
};

// Alias for backward compatibility (can be removed later)
export const tableStyle = hrRepositoryTableStyle;
