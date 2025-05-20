# Inventory Backend (Node.js + SQL Server)

This is the backend API for the Building Inventory System, built with:

- Node.js
- Express
- Microsoft SQL Server
- Hosted on Render (recommended)

---

## 📦 How to Run Locally

### 1. Clone this repository
```bash
git clone https://github.com/carlosdalterio/inventory-backend.git
cd inventory-backend
```

### 2. Create a `.env` file based on the example
Create a file called `.env` in the root directory:

```env
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=your_sql_server
DB_NAME=nis
```

> Make sure the SQL Server allows remote connections and the IP is accessible.

---

### 3. Install dependencies
```bash
npm install
```

---

### 4. Start the server
```bash
node index.js
```

Server will run on:  
```
http://localhost:3001
```

---

## 📌 API Endpoints

| Method | Endpoint         | Description             |
|--------|------------------|-------------------------|
| GET    | `/buildingwings` | List all building wings |
| POST   | `/components`    | Add a new component     |

---

## ✅ Environment Variables (`.env`)

Make sure to provide the following values:

- `DB_USER`: SQL Server login
- `DB_PASSWORD`: SQL Server password
- `DB_SERVER`: Hostname or IP of your SQL Server
- `DB_NAME`: Your database name (e.g., `nis`)

---

## ☁️ Recommended Hosting

You can deploy this backend on **Render** for free:  
https://render.com
