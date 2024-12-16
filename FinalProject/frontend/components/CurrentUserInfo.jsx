import "./UserEditor.css";
import { useNavigate } from "react-router-dom";


const CurrentUserInfo = ({auth}) => {
  const navigate = useNavigate();
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
              <label htmlFor="fullNameForm" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="fullNameForm"
                value={auth.givenName}
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
