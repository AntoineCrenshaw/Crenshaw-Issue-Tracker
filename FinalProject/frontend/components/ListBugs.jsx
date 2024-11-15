import { useEffect, useState } from "react";
import axios from "axios";

const ListBugs = () => {
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    axios
      .get("/api/bugs")
      .then((res) => res.json())
      .then((data) => setBugs(data.bugs));
  }, [bugs]);
  return (
    <>
      <main>
        <div className=" flex flex-col container pt-[1rem] gap-x-8 gap-y-10">
          <div className="row">
            <h2>Bugs</h2>
            <a className="list-items" href="/api/bugs/1">
              Runtime Error
            </a>
            <a className="list-items" href="/api/bugs/2">
              Syntax Errors
            </a>
            <a className="list-items" href="/api/bugs/3">
              Error 404
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default ListBugs;
