import "./UserEditor.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";


const CurrentUserInfo = ({auth}) => {

useEffect(() => {
  console.log(auth, "auth being displayed correctly")
  axios.get("http://localhost:2024/api/users/me", {
    headers: { authorization: `Bearer ${auth?.token}` }
  })
}, [auth]);

  return (
    <>
    {auth && (
      
     <div className="user-card-container">
       <div className="card">
        <div className="bg-white">
        <div className="card-body">
          <form >
            <div className="mb-3">
              <label htmlFor="emailForm" className="form-label">
                Email
              </label>
              <input
                type="text"
                className="form-control"
                id="emailForm"
                value={auth.email}
        
              />
            </div>
            <div className="mb-3">
              <label htmlFor="nameForm" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="nameForm"
                value={auth.familyName}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="roleForm" className="form-label">
                Roles
              </label>
              <input
                type="text"
                className="form-control"
                id="roleForm"
                value={auth.role}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="permissions" className="form-label">
               Permissions
              </label>
              <input
                type="text"
                className="form-control"
                id="permissions"
                value={auth.permissions}
              />
            </div>
        
          </form>
        </div>
        </div>
       </div>
     </div>
      )}
    </>
  );
};

export default CurrentUserInfo;
