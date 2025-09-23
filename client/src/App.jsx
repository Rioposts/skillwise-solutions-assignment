import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    image: '',
    name: '',
    unit: '',
    category: '',
    brand: '',
    stock: '',
    status: 'In Stock'
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    let url = 'http://localhost:5000/api/products/search?';
    if (searchText) url += `name=${encodeURIComponent(searchText)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(setProducts);
  }, [searchText, category]);

  const categories = ['Electronics', 'Food', 'Toys'];

  // Edit mode
  const startEditing = (prod) => {
    setEditingId(prod.id);
    setEditData(prod);
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'stock' ? Number(value) : value
    }));
  };

  const saveEdit = (id) => {
    fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
      .then(res => res.json())
      .then((updated) => {
        setProducts(products.map(prod => prod.id === id ? updated : prod));
        setEditingId(null);
      });
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
      .then(() => setProducts(products.filter(prod => prod.id !== id)));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev, [name]: value
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.unit || !newProduct.category || !newProduct.brand || !newProduct.stock) {
      alert("Please fill all fields");
      return;
    }
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, stock: Number(newProduct.stock) }),
    })
      .then(res => res.json())
      .then((prod) => {
        setProducts([...products, prod]);
        setShowModal(false);
        setNewProduct({
          image: '',
          name: '',
          unit: '',
          category: '',
          brand: '',
          stock: '',
          status: 'In Stock'
        });
      });
  };

  const handleImport = () => alert("Import feature coming soon!");
  const handleExport = () => alert("Export feature coming soon!");

  return (
    <div>
      <h1>Skillwise Solutions Assignment</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={handleImport}>Import</button>
          <button style={{ marginLeft: 8 }} onClick={handleExport}>Export</button>
          <button style={{ marginLeft: 8, background: '#304ffe', color: '#fff' }} onClick={() => setShowModal(true)}>
            Add New Product
          </button>
        </div>
      </div>

      <table border="1" style={{ margin: 'auto' }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            editingId === prod.id
              ?
              <tr key={prod.id}>
                <td>{prod.image ? <img src={prod.image} alt="" width={50} /> : 'N/A'}</td>
                <td><input name="name" value={editData.name} onChange={handleEditInput} /></td>
                <td><input name="unit" value={editData.unit} onChange={handleEditInput} /></td>
                <td><input name="category" value={editData.category} onChange={handleEditInput} /></td>
                <td><input name="brand" value={editData.brand} onChange={handleEditInput} /></td>
                <td><input name="stock" type="number" value={editData.stock} onChange={handleEditInput} /></td>
                <td>
                  <select name="status" value={editData.status} onChange={handleEditInput}>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => saveEdit(prod.id)}>Save</button>
                  <button style={{ marginLeft: 8 }} onClick={cancelEdit}>Cancel</button>
                </td>
              </tr>
              :
              <tr key={prod.id}>
                <td>{prod.image ? <img src={prod.image} alt="" width={50} /> : 'N/A'}</td>
                <td>{prod.name}</td>
                <td>{prod.unit}</td>
                <td>{prod.category}</td>
                <td>{prod.brand}</td>
                <td>{prod.stock}</td>
                <td style={{ color: prod.status === 'In Stock' ? 'green' : 'red' }}>{prod.status}</td>
                <td>
                  <button onClick={() => startEditing(prod)}>Edit</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDelete(prod.id)}>Delete</button>
                </td>
              </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form style={{
            background: '#fff', padding: '24px', borderRadius: 4, minWidth: 350
          }} onSubmit={handleAddProduct}>
            <h2>Add New Product</h2>
            <input name="name" type="text" placeholder="Name" value={newProduct.name} onChange={handleInputChange} /><br />
            <input name="unit" type="text" placeholder="Unit" value={newProduct.unit} onChange={handleInputChange} /><br />
            <input name="category" type="text" placeholder="Category" value={newProduct.category} onChange={handleInputChange} /><br />
            <input name="brand" type="text" placeholder="Brand" value={newProduct.brand} onChange={handleInputChange} /><br />
            <input name="stock" type="number" placeholder="Stock" value={newProduct.stock} onChange={handleInputChange} /><br />
            <select name="status" value={newProduct.status} onChange={handleInputChange}>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select><br />
            <input name="image" type="text" placeholder="Image URL (optional)" value={newProduct.image} onChange={handleInputChange} /><br />
            <button type="submit">Add Product</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
