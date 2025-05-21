

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// SQL Server config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Test route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Get BuildingWings
app.get('/buildingwings', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT * FROM BuildingWing');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Add Component
app.post('/components', async (req, res) => {
    const { ComponentTypeID, CampusID, FacilityID, BuildingWingID, InstallDate, UniqueTag } = req.body;
    try {
        await sql.connect(dbConfig);
        const result = await sql.query`
            INSERT INTO Component (ComponentTypeID, CampusID, FacilityID, BuildingWingID, InstallDate, UniqueTag)
            VALUES (${ComponentTypeID}, ${CampusID}, ${FacilityID}, ${BuildingWingID}, ${InstallDate}, ${UniqueTag})`;
        res.status(200).send('Component added');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database insert error');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


