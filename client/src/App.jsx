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
  const [showSidebar, setShowSidebar] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let url = 'http://localhost:5000/api/products/search?';
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

  // Export CSV
  const handleExport = () => {
    fetch('http://localhost:5000/api/products/export')
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.csv';
        a.click();
      });
  };

  // Import CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:5000/api/products/import', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        alert(`Imported ${data.imported} products`);
        setProducts([...products, ...data.products]);
      });
  };

  // Sidebar
  const fetchHistory = () => {
    fetch('http://localhost:5000/api/history')
      .then(res => res.json())
      .then(setHistory);
  };

  return (
    <div style={{
      background: "#18181c",
      minHeight: "100vh",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h1 style={{
        textAlign: "center",
        paddingTop: 32,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: 2
      }}>
        Skillwise Solutions Assignment
      </h1>
      <div style={{ width: "100%", maxWidth: 980, margin: "36px auto 24px" }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                padding: 10, fontSize: 18, borderRadius: 7, border: "1px solid #333", width: 220, marginRight: 8
              }}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ padding: 10, fontSize: 18, borderRadius: 7, border: "1px solid #333", minWidth: 160 }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              id="csvImportInput"
              onChange={handleImport}
            />
            <button style={{
              marginRight: 8, padding: "10px 20px", fontSize: 17, borderRadius: 7, background: "#222", color: "#fff", fontWeight: "bold"
            }} onClick={() => document.getElementById('csvImportInput').click()}>Import</button>
            <button style={{
              marginRight: 8, padding: "10px 20px", fontSize: 17, borderRadius: 7, background: "#222", color: "#fff", fontWeight: "bold"
            }} onClick={handleExport}>Export</button>
            <button style={{
              marginRight: 8, padding: "10px 20px", fontSize: 17, borderRadius: 7,
              background: '#304ffe', color: '#fff', fontWeight: "bold", boxShadow: "0 3px 12px #304ffe88"
            }} onClick={() => setShowModal(true)}>Add New Product</button>
            <button style={{
              background: '#181c24', color: '#fff', border: "1px solid #304ffe",
              padding: "10px 20px", fontSize: 17, borderRadius: 7, fontWeight: "bold"
            }} onClick={() => {
              setShowSidebar(!showSidebar);
              if (!showSidebar) fetchHistory();
            }}>
              {showSidebar ? 'Close History' : 'Show Inventory History'}
            </button>
          </div>
        </div>
      </div>
      <div style={{
        maxWidth: 1100,
        width: "100%",
        margin: "14px auto",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 24px #2224",
        background: "#232330"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#232330",
          borderRadius: 16,
          fontSize: 17
        }}>
          <thead>
            <tr style={{ background: "#2e3850", color: "#fff" }}>
              <th style={{ padding: "14px 10px" }}>Image</th>
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
                <tr key={prod.id} style={{ background: "#2b2b38" }}>
                  <td>{prod.image ? <img src={prod.image} alt="" width={50} style={{ borderRadius: 8 }} /> : 'N/A'}</td>
                  <td><input name="name" value={editData.name} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }} /></td>
                  <td><input name="unit" value={editData.unit} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }} /></td>
                  <td><input name="category" value={editData.category} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }} /></td>
                  <td><input name="brand" value={editData.brand} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }} /></td>
                  <td><input name="stock" type="number" value={editData.stock} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }} /></td>
                  <td>
                    <select name="status" value={editData.status} onChange={handleEditInput} style={{ padding: 7, borderRadius: 6, fontSize: 16 }}>
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveEdit(prod.id)} style={{ padding: "8px 16px", marginRight: 6, borderRadius: 6, background: "#294cfa", color: "#fff" }}>Save</button>
                    <button onClick={cancelEdit} style={{ padding: "8px 16px", borderRadius: 6, background: "#333", color: "#fff" }}>Cancel</button>
                  </td>
                </tr>
                :
                <tr key={prod.id} style={{ background: "#232330", borderBottom: "2px solid #222" }}>
                  <td>{prod.image ? <img src={prod.image} alt="" width={50} style={{ borderRadius: 8 }} /> : 'N/A'}</td>
                  <td>{prod.name}</td>
                  <td>{prod.unit}</td>
                  <td>{prod.category}</td>
                  <td>{prod.brand}</td>
                  <td>{prod.stock}</td>
                  <td style={{ color: prod.status === 'In Stock' ? '#53e262' : '#ee6060', fontWeight: 600 }}>
                    {prod.status}
                  </td>
                  <td>
                    <button onClick={() => startEditing(prod)} style={{ padding: "8px 16px", marginRight: 6, borderRadius: 6, background: "#294cfa", color: "#fff" }}>Edit</button>
                    <button onClick={() => handleDelete(prod.id)} style={{ padding: "8px 16px", borderRadius: 6, background: "#ee6060", color: "#fff" }}>Delete</button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showSidebar && (
        <div style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, width: '340px',
          background: '#181c23', color: '#fff', padding: '24px 18px',
          boxShadow: '-2px 0 20px #0007', zIndex: 1000, transition: 'right 0.3s'
        }}>
          <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: 24 }}>Inventory History</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {history.map((item, i) => (
              <li key={i} style={{
                margin: '12px 0',
                padding: '14px 12px',
                borderRadius: 5,
                background: '#232a35',
                fontSize: 16
              }}>{item}</li>
            ))}
          </ul>
          <button style={{
            margin: '16px 0 0', padding: '9px 18px', background: "#333", color: "#fff", borderRadius: 6, fontSize: 16
          }} onClick={() => setShowSidebar(false)}>Close</button>
        </div>
      )}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.32)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <form style={{
            background: '#232330', padding: '36px 32px', borderRadius: 10,
            minWidth: 360, color: "#fff", boxShadow: "0 10px 40px #27296944"
          }} onSubmit={handleAddProduct}>
            <h2 style={{ fontWeight: 700, marginTop: 0, marginBottom: 18 }}>Add New Product</h2>
            <input name="name" type="text" placeholder="Name" value={newProduct.name}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%" }} />
            <input name="unit" type="text" placeholder="Unit" value={newProduct.unit}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%" }} />
            <input name="category" type="text" placeholder="Category" value={newProduct.category}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%" }} />
            <input name="brand" type="text" placeholder="Brand" value={newProduct.brand}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%" }} />
            <input name="stock" type="number" placeholder="Stock" value={newProduct.stock}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%" }} />
            <select name="status" value={newProduct.status} onChange={handleInputChange}
              style={{ padding: 10, borderRadius: 6, marginBottom: 9, width: "100%", fontSize: 16 }}>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <input name="image" type="text" placeholder="Image URL (optional)" value={newProduct.image}
              onChange={handleInputChange} style={{ padding: 10, borderRadius: 6, marginBottom: 14, width: "100%" }} />
            <button type="submit" style={{
              padding: "11px 22px", borderRadius: 7, background: "#304ffe", color: "#fff", fontWeight: "bold", fontSize: 17,
              marginTop: 6, boxShadow: "0 2px 12px #304ffe88"
            }}>Add Product</button>
            <button type="button" onClick={() => setShowModal(false)}
              style={{ padding: "11px 22px", borderRadius: 7, background: "#333", color: "#fff", fontWeight: "bold", fontSize: 17, marginLeft: 10, marginTop: 6 }}>
              Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
