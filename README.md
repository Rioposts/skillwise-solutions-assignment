# Skillwise Solutions Assignment

This project is a **full-stack product inventory management system** built as part of an internship assignment.  
It demonstrates **search, filtering, CRUD operations, CSV import/export, and inventory history tracking** using a modern MERN-style stack.

---

## 🚀 Tech Stack
- **Frontend**: React (Vite/CRA)  
- **Backend**: Node.js + Express  
- **CSV Handling**: `csv-writer`, `csv-parser`  
- **Styling**: Custom CSS (clean dashboard theme)  
- **Deployment**: Render (Backend) + Netlify (Frontend)  

---

## ✨ Features Implemented

### Frontend
- 🔍 **Product Search & Filtering**  
  - Search by product name  
  - Filter by category  

- 📦 **Product Table**  
  - Columns: Image, Name, Unit, Category, Brand, Stock, Status, Actions  
  - Inline editing with Save/Cancel  
  - Delete with confirmation  

- ➕ **Add New Product**  
  - Modal form with validation  
  - Supports image URL, stock, brand, category, etc.  

- 📥 **Import Products (CSV)**  
  - Upload CSV to backend, new products auto-added  
  - Duplicates skipped  

- 📤 **Export Products (CSV)**  
  - Download all products as CSV  

- 📊 **Inventory History Sidebar**  
  - Slide-in panel with recent actions (add/edit/delete/import)  
  - Shows up to 30 latest changes  

- 🎨 **UI/UX**  
  - Clean dark dashboard theme  
  - Green for "In Stock", Red for "Out of Stock"  

---

### Backend (Express APIs)
- `GET /api/products` → List all products  
- `GET /api/products/search?name=&category=` → Search & filter  
- `POST /api/products` → Add new product  
- `PUT /api/products/:id` → Update product (inline editing)  
- `DELETE /api/products/:id` → Delete product  
- `POST /api/products/import` → Import products via CSV  
- `GET /api/products/export` → Export products as CSV  
- `GET /api/history` → Get inventory history logs  

---


---

## ⚡ Deployment
- **Frontend (Netlify)**: [Live Demo Link]()  
- **Backend (Render)**: [API Link]()  

> ⚠️ Note: Make sure the backend is running before testing frontend features.

---


## 🛠️ How to Run Locally
```bash
# Clone repo
git clone https://github.com/yourusername/skillwise-assignment.git
cd skillwise-assignment

# Run backend
cd server
npm install
npm start

# Run frontend
cd ../client
npm install
npm start
```

## Built by Fawaz