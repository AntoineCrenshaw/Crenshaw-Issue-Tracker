import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

const ProductListItem = () => {
const { id } = useParams();
const [product, setProduct] = useState(null);
const [selectedProduct, setSelectedProduct] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [showModal, setShowModal] = useState(false);

const navigate = useNavigate();

useEffect(() => {
  setIsLoading(true);
  console.log("ID from URL: ", id);
  axios
    .get(`http://localhost:2023/api/products/${id}`, { withCredentials: true })
    .then((response) => {
      console.log(response.data);
      setProduct(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
  setIsLoading(false);
}, [id]);

const handleConfirmDelete = async (e, id) => {
  console.log("Deleting product with ID: ", id);
  e.preventDefault();
  try {
    await axios.delete(`http://localhost:2023/api/products/${id}`, {
      withCredentials: true,
    });
    console.log("Product deleted successfully");
    setShowModal(false);
    console.log("Navigating to /products");
    navigate("/products");
  } catch (e) {
    console.error(e);
  }
};

const handleProductClick = (product) => {
  setSelectedProduct(product);
  setShowModal(true);
};


  return (
    <>
      {isLoading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : product ? (
        <Paper
          variant="h6"
          sx={{
            padding: 3.5,
            margin: 2,
            gap: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Product Name: {product.name}</Typography>
          <Typography variant="h6">Description: {product.description}</Typography>
          <Typography variant="h6">Price: {product.price}</Typography>
          <Typography variant="h6">Category: {product.category}</Typography>
      
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/products/${product._id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleProductClick(product)}
            >
              Delete
            </Button>
          </Box>
          {showModal && selectedProduct && (
          <Dialog open={showModal}>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this product?</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={(e) => handleConfirmDelete(e, product._id)}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          )}
        </Paper>
      ) : (
        <Typography variant="h2">No product found</Typography>
      )}
    </>
  )
}

export default ProductListItem