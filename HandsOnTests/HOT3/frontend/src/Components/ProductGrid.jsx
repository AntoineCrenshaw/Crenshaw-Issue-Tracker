import { Typography, Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

const ProductGrid = ({ products }) => {
  return (
    <>
      <Typography variant='h1' sx={{ my: 2 }}>Products</Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  my: 2,
                  padding: "3.5rem",
                  "&:hover": {
                    position: "relative",
                    right: "5px",
                    bottom: "5px",
                    flex: "1 1 500px",
                  },
                }}
              >
                <Typography variant="h4">{product.name}</Typography>
                <Typography variant="body1">{product.description}</Typography>
                <Typography variant="h6">${product.price}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default ProductGrid;