import { useState, useEffect } from 'react';
import './App.css'; // Import external stylesheet

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let url = 'https://skillwise-solutions-assignment.onrender.com/api/products/search?';
    if (searchText) url += `name=${encodeURIComponent(searchText)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(setProducts);
  }, [searchText, category]);

  const categories = ['Electronics', 'Food', 'Toys'];

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
    fetch(`https://skillwise-solutions-assignment.onrender.com/api/products/${id}`, {
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
    fetch(`https://skillwise-solutions-assignment.onrender.com/api/products/${id}`, { method: 'DELETE' })
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
    fetch('https://skillwise-solutions-assignment.onrender.com/api/products', {
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

  const handleExport = () => {
    fetch('https://skillwise-solutions-assignment.onrender.com/api/products/export')
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.csv';
        a.click();
      });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    fetch('https://skillwise-solutions-assignment.onrender.com/api/products/import', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        alert(`Imported ${data.imported} products`);
        setProducts([...products, ...data.products]);
      });
  };

  const fetchHistory = () => {
    fetch('https://skillwise-solutions-assignment.onrender.com/api/history')
      .then(res => res.json())
      .then(setHistory);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Skillwise Solutions Assignment</h1>

      <div className="controls-container">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="action-buttons">
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            id="csvImportInput"
            onChange={handleImport}
          />
          <button onClick={() => document.getElementById('csvImportInput').click()} className="btn">Import</button>
          <button onClick={handleExport} className="btn">Export</button>
          <button onClick={() => setShowModal(true)} className="btn primary">Add New Product</button>
          <button
            className="btn secondary"
            onClick={() => {
              setShowSidebar(!showSidebar);
              if (!showSidebar) fetchHistory();
            }}>
            {showSidebar ? 'Close History' : 'Show Inventory History'}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="products-table">
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
              editingId === prod.id ? (
                <tr key={prod.id} className="editing-row">
                  <td>{prod.image ? <img src={prod.image} alt="" width={50} className="product-img" /> : 'N/A'}</td>
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
                    <button onClick={() => saveEdit(prod.id)} className="btn small primary">Save</button>
                    <button onClick={cancelEdit} className="btn small secondary">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={prod.id}>
                  <td>{prod.image ? <img src={prod.image} alt="" width={50} className="product-img" /> : 'N/A'}</td>
                  <td>{prod.name}</td>
                  <td>{prod.unit}</td>
                  <td>{prod.category}</td>
                  <td>{prod.brand}</td>
                  <td>{prod.stock}</td>
                  <td className={prod.status === 'In Stock' ? 'status in-stock' : 'status out-stock'}>
                    {prod.status}
                  </td>
                  <td>
                    <button onClick={() => startEditing(prod)} className="btn small primary">Edit</button>
                    <button onClick={() => handleDelete(prod.id)} className="btn small danger">Delete</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <div className="sidebar">
          <h2>Inventory History</h2>
          <ul>
            {history.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <button onClick={() => setShowSidebar(false)} className="btn secondary">Close</button>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <form onSubmit={handleAddProduct} className="modal-form">
            <h2>Add New Product</h2>
            <input name="name" type="text" placeholder="Name" value={newProduct.name} onChange={handleInputChange} />
            <input name="unit" type="text" placeholder="Unit" value={newProduct.unit} onChange={handleInputChange} />
            <input name="category" type="text" placeholder="Category" value={newProduct.category} onChange={handleInputChange} />
            <input name="brand" type="text" placeholder="Brand" value={newProduct.brand} onChange={handleInputChange} />
            <input name="stock" type="number" placeholder="Stock" value={newProduct.stock} onChange={handleInputChange} />
            <select name="status" value={newProduct.status} onChange={handleInputChange}>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <input name="image" type="text" placeholder="Image URL (optional)" value={newProduct.image} onChange={handleInputChange} />
            <button type="submit" className="btn primary">Add Product</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn secondary">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
