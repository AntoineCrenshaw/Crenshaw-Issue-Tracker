import ProductGrid from "./ProductGrid"
import { Typography } from "@mui/material"
import { useEffect, useState } from "react"
import axios from "axios"

const ProductsList = () => {

const [products, setProducts] = useState([]);
const [isLoading, setIsLoading] = useState(false);

const getProducts = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get("http://localhost:2023/api/products", {
      withCredentials: true,
    });
    console.log(response.data);
    setProducts(response.data); 
  } catch (e) {
    console.error(e);
  }
  setIsLoading(false);
};

useEffect(() => {
  getProducts();
}, []);

  return (
    <>
    {isLoading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : products.length > 0 ? (
          <ProductGrid products={products} />
      ) : (
        <Typography variant="h2">No products found</Typography>
      )}
    </>
  )
}

export default ProductsList