import { useState, useEffect } from "react";
import axios from "axios";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const getUsers = async () => {
    try {
      let response = await axios.get("/api/users");
      setUsers(response.data.users || []);
      setMessage(response.data.message || "No users found");
    } catch (e) {
      setMessage(e.response.data.message || "Error fetching users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} className="users-container">
            <div className="users-box">
              <div className="users-title">
                <h2>{user.name}</h2>
              </div>
              <div className="users-form">
                <a className="list-items">
                  <div>Email: {user.email}</div>
                  <div>Name: {user.fullName}</div>
                  <div>Role: {user.role}</div>
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>{message}</div>
      )}
    </>
  );
};

export default ListUsers;
