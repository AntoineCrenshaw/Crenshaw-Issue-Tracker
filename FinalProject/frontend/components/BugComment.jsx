import moment from "moment";

const BugComment = (comment, index) => {
  return (
    <tr>
      <td scope="row">{index + 1}</td>
      <td>{comment.comment}</td>
      <td>{moment(comment.createdOn).fromNow()}</td>
    </tr>
  );
};

export default BugComment;
