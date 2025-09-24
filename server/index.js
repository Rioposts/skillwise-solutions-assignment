const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { createObjectCsvWriter } = require('csv-writer');
const csvParser = require('csv-parser');

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
    image: '',
    name: 'Sample Product',
    unit: 'pcs',
    category: 'Electronics',
    brand: 'BrandX',
    stock: 10,
    status: 'In Stock'
  },
  {
    id: 2,
    image: '',
    name: 'Sample Product 2',
    unit: 'dolls',
    category: 'Toys',
    brand: 'BrandT',
    stock: 30,
    status: 'In Stock'
  }
];

let historyLog = [];

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
  historyLog.push(`Added product "${newProduct.name}" (${newProduct.category})`);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const oldProd = products.find(p => p.id === id);
  products = products.map(p => p.id === id ? { ...p, ...req.body } : p);
  historyLog.push(`Edited product "${oldProd.name}" (${oldProd.category})`);
  res.json(products.find(p => p.id === id));
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const prod = products.find(p => p.id === id);
  products = products.filter(p => p.id !== id);
  historyLog.push(`Deleted product "${prod?.name}" (${prod?.category})`);
  res.sendStatus(204);
});

// Export Products to CSV 
app.get('/api/products/export', (req, res) => {
  const csvWriter = createObjectCsvWriter({
    path: 'products.csv',
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'unit', title: 'Unit' },
      { id: 'category', title: 'Category' },
      { id: 'brand', title: 'Brand' },
      { id: 'stock', title: 'Stock' },
      { id: 'status', title: 'Status' },
      { id: 'image', title: 'Image' },
    ],
  });
  csvWriter.writeRecords(products).then(() => {
    res.download('products.csv', 'products.csv', (err) => {
      if (err) res.status(500).send('Error downloading CSV');
      else fs.unlinkSync('products.csv');
    });
  });
});

//Import Products from CSV 
app.post('/api/products/import', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
      if (!products.some(p => p.name === data.name && p.category === data.category)) {
        const newProd = {
          id: products.length + 1,
          name: data.name,
          unit: data.unit,
          category: data.category,
          brand: data.brand,
          stock: Number(data.stock),
          status: data.status,
          image: data.image,
        };
        products.push(newProd);
        results.push(newProd);
        historyLog.push(`Imported product "${newProd.name}" (${newProd.category})`);
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ imported: results.length, products: results });
    });
});

//Inventory History API 
app.get('/api/history', (req, res) => {
  res.json(historyLog.slice(-30).reverse());
});
