import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./ListBugs.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";

const ListBugs = () => {
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getBugs = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("http://localhost:2024/api/bugs", {
        withCredentials: true,
      });
      console.log(data);
      setBugs(data.bugs || []);
      setMessage(data.message || "You must be signed in to view bugs");
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Error fetching users. You must be signed in to view bugs"
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getBugs();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="bugs-container mt-5">
          <table className="bugs-table skeletonWrapper">
            <caption>Bugs</caption>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((bug) => (
                <tr key={bug._id}>
                  <td>{<Skeleton />}</td>
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
          <div className="bugs-container mt-5">
            {bugs.length > 0 ? (
              <table className="bugs-table">
                <caption>Bugs</caption>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.map((bug) => (
                    <tr key={bug._id}>
                      <td>{bug.title}</td>
                      <td>{bug.description}</td>
                      <td>{bug.classification}</td>
                      <td>{bug.assignedToUserName}</td>
                      <td>
                        <span>
                          <span>
                            <button className="btn btn-link">
                              <NavLink to={`/bugs/${bug._id}`}>
                                <i className="bi bi-pencil"></i>
                              </NavLink>
                            </button>
                            <i className="bi bi-trash3"></i>
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListBugs;
