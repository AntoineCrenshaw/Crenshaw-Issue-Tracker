import { useState, useEffect } from "react";
import axios from "axios";
import "./ListUsers.css";
import Skeleton from "react-loading-skeleton";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="users-container">
          <table className="users-table skeletonWrapper">
            <caption>Current Users</caption>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{<Skeleton />}</td>
                  <td>{<Skeleton />}</td>
                  <td>{<Skeleton />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
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
        </div>
      )}
    </>
  );
};

export default ListUsers;
