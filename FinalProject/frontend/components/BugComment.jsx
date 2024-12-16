import moment from "moment";

const BugComment = (comments, index) => {
  return (
    <tr>
      <td scope="row">{index + 1}</td>
      <td>{comments.comment}</td>
      <td>{moment(comments.createdOn).fromNow()}</td>
    </tr>
  );
};

export default BugComment;
