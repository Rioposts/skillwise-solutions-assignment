const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

let products = [
  {
    id: 1,
    image: '', // placeholder for image URL
    name: 'Sample Product',
    unit: 'pcs',
    category: 'Electronics',
    brand: 'BrandX',
    stock: 10,
    status: 'In Stock'
  },
   {
    id: 2,
    image: '', // placeholder for image URL
    name: 'Sample Product 2',
    unit: 'dolls',
    category: 'Toys',
    brand: 'BrandT',
    stock: 30,
    status: 'In Stock'
  }
];

// GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET products by search query or category
app.get('/api/products/search', (req, res) => {
  const { name, category } = req.query;
  let result = products;
  if (name) result = result.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  res.json(result);
});

// POST add new product
app.post('/api/products', (req, res) => {
  const newProduct = { id: products.length + 1, ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.map(p => p.id === id ? { ...p, ...req.body } : p);
  res.json(products.find(p => p.id === id));
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  products = products.filter(p => p.id !== id);
  res.sendStatus(204);
});
