import { useState, useEffect } from "react";
import axios from "axios";
import "./ListUsers.css";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const getUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:2024/api/users");
      setUsers(data.users || []);
      setMessage(data.message || "No users found");
    } catch (e) {
      setMessage(e.response?.data?.message || "Error fetching users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="users-container">
      {users.length > 0 ? (
        <table className="users-table">
          <caption>Current Users</caption>
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="users-message">{message}</div>
      )}
    </div>
  );
};

export default ListUsers;
