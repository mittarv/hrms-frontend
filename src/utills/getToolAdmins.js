import store from '../store'
// import { fetchUserGroups } from '../actions/userGroupsActions'

// const fetchUserPermissionsData = async () => {
//     await store.dispatch(fetchUserPermissions())
// }

/* ---- Sample data we get from the user permissions api
{
            "user": {
                "userId": 3,
                "name": "Debabrata Basak",
                "email": "debabrata.basak@mittarv.com"
            },
            "tools": [
                {
                    "userGroup": {
                        "role": "Tool Admin",
                        "value": 1000,
                        "id": 9
                    },
                    "tool": {
                        "toolId": 37,
                        "name": "Workspace"
                    }
                },
                {
                    "userGroup": {
                        "role": "Viewer",
                        "value": 1000,
                        "id": 6
                    },
                    "tool": {
                        "toolId": 41,
                        "name": "Av-Tools"
                    }
                }
            ]
        },
*/


export const getToolAdminsOfSpecificTool = (toolId, toolAdminsData) => {
    const state = store.getState()
    const { userPermissionsDataa } = state.userpermissions;
    const { userGroupsData }  =  state.usergroup;
    const toolAdminId = userGroupsData?.find((group) => group.role === "Tool Admin").id
    let toolAdmins = new Map();
    // console.log(toolId)

    // Filter the data that includes the toolId
    if (userPermissionsDataa?.length <= 0) {
        let toolAdminArr = Array.from(toolAdmins.values())
        return toolAdminArr
    }


    for (let permission of userPermissionsDataa) {
        let user = permission.user;
        let tools = permission.tools;

        for (let tool of tools) {
            // console.log(tool)
            if (tool?.userGroup?.role === "Tool Admin" && tool?.tool?.toolId === toolId) {
                // console.log(tool)
                toolAdmins.set(user.userId , user)
            }

            // break;
        }
    }
    if(toolAdminsData?.length <= 0 || !toolAdminsData){
        let toolAdminArr = Array.from(toolAdmins.values())
        return toolAdminArr
    }
    for (let admin of toolAdminsData) {
        // console.log(admin)
        if (admin.toolId === toolId) {
          if (admin.userGroupId !== toolAdminId) {
            // console.log("In the if")
            // Remove user from the map if userGroupId is not Tool Admin
            toolAdmins.delete(admin.userId);
          } else {
            // console.log("In ghe else")
            // Find the corresponding user data from userGroupsData
            let userData = userPermissionsDataa.find(user => user.user.userId === admin.userId).user
            // console.log(admin)
            // console.log(userData)
            if (userData) {
                toolAdmins.set(admin.userId, userData); // Add or override the user data
            }
          }
        }
      }

    let toolAdminArr = Array.from(toolAdmins.values())
    

    return toolAdminArr

}

