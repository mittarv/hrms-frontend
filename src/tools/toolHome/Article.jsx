import { useEffect, useState } from "react";
import ArticleTable from "../toolComponents/ArticleTable";
import ArticleEditTable from "../toolComponents/ArticleEditTable";
import { toolHomePageData } from "../../constant/data";
import { useDispatch } from "react-redux";
const Article = () => {
  const dispatch = useDispatch();
  const [showEdit, setShowEdit] = useState(false);
  const toggleOptions = () => {
    setShowEdit(!showEdit);
  };

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: toolHomePageData.tool_title3
    });
  }, [dispatch])

  return (
    <>
      {showEdit === false ? (
        <ArticleTable isEdit={showEdit} toggleOptions={toggleOptions} />
      ) : (
        <ArticleEditTable isEdit={showEdit} toggleOptions={toggleOptions} />
      )}
    </>
  );
};

export default Article;
