import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";

const ProductEditor = ({ showError, showSuccess }) => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:2023/api/products/${id}`, {
        withCredentials: true,
      })

      .then((response) => {
        console.log(response.data.products);
        setProduct(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
        setPrice(response.data.price);
        setCategory(response.data.category);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  const onProductUpdate = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const updatedProduct = {
      ...product,
      name,
      description,
      price,
      category,
    };

    delete updatedProduct._id;

    try {
      let response = await axios.patch(
        `http://localhost:2023/api/products/${id}`,
        { ...updatedProduct },
        { withCredentials: true }
      );
      console.log(response);
      navigate("/products");
    } catch (e) {
      console.error(e);
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    console.log("Cancelling edit");
    navigate("/products");
  };

  return (
    <>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 2, mt: 6, height: "fit-content" }}>
          <Typography variant="h2" sx={{ textAlign: "center" }}>
            Edit Product
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => onProductUpdate(e)}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Price"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={category}
              onChange={(e) => setProduct(e.target.value)}
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
              <Button
                onClick={(e) => cancelEdit(e)}
                variant="contained"
                color="secondary"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ProductEditor;
