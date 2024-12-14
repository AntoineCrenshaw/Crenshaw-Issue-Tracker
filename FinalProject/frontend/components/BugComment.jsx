const BugComment = () => {
  return (
    <form>
      <div className="form-group">
        <label htmlFor="comment">Comment</label>
        <textarea className="form-control" id="comment" rows="3"></textarea>
      </div>
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default BugComment;
