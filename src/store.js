import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { userGroupsReducer } from "./reducers/userGroupsReducer";
import { userPermissionsReducer } from "./reducers/userPermissionsReducer";
import { userToolsReducer } from "./reducers/userToolsReducer";
import { mittarvToolsReducer } from "./reducers/mittarvToolsReducer";
import { hrRepositoryReducer } from "./reducers/hrRepositoryReducer";
import { requestsReducer } from "./reducers/requestsReducers";
import { userToolAccessReducer } from "./reducers/userToolAccessReducer";
const store = configureStore({
  reducer: {
    user: userReducer,
    usergroup: userGroupsReducer,
    userpermissions: userPermissionsReducer,
    usertools: userToolsReducer,
    mittarvtools: mittarvToolsReducer,
    hrRepositoryReducer: hrRepositoryReducer,
    requestsReducer: requestsReducer,
    userToolAccess: userToolAccessReducer,
  },
  //middleware checks if the action is serializable
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
