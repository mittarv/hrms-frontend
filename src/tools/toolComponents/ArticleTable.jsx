import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { tableStyle } from "../../constant/tableStyle";
import { useEffect } from "react";
import ArticleHeader from "./ArticleHeader";
import { useDispatch, useSelector } from "react-redux";
import { convertDateOnly } from "../../utills/convertDate";
import { fetchAllArticle } from "../../actions/articleAction";

const ArticleTable = ({ toggleOptions }) => {
  const {
    StyledTableRow,
    StyledTableCell,
    TableStyle,
    TableHeaderStyle,
    ToolNameStyle,
  } = tableStyle;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAllArticle());
  }, [dispatch]);

  const { newsArticle, isLoading } = useSelector(
    (state) => state.articleReducer
  );
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  return (
    <>
      <ArticleHeader isEdit={false} toggleOptions={toggleOptions} />
      <TableContainer style={TableStyle}>
        <Table style={{ marginTop: "40px" }}>
          <TableHead>
            <TableRow>
              <StyledTableCell style={TableHeaderStyle}>Title</StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Excerpts
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Release Date
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                News Paper Name
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                News Paper Link
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                Begin Date
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>
                End Date
              </StyledTableCell>
              <StyledTableCell style={TableHeaderStyle}>Image</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newsArticle &&
              newsArticle.map((tool, index) => (
                <StyledTableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell style={ToolNameStyle}>
                    {tool.title.length > 40
                      ? tool.title.substring(0, 40) + "..."
                      : tool.title}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {tool.excerpts.length > 40
                      ? tool.excerpts.substring(0, 40) + "..."
                      : tool.excerpts}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {convertDateOnly(tool?.releaseDate)}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {tool?.newsPaperName}
                  </TableCell>

                  <TableCell style={ToolNameStyle}>{tool?.newsLink}</TableCell>
                  <TableCell style={ToolNameStyle}>
                    {convertDateOnly(tool?.beginDate)}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {convertDateOnly(tool?.endDate)}
                  </TableCell>
                  <TableCell style={ToolNameStyle}>
                    {tool?.image.length > 40
                      ? tool.image.substring(0, 40) + "..."
                      : tool.image}
                  </TableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ArticleTable;
