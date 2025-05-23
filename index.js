const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Função para tentar conectar a uma faixa de IPs
async function findActiveIP(baseIP, port, maxAttempts = 10) {
    const [octet1, octet2, octet3] = baseIP.split('.').slice(0, 3); // Ex.: 72.10.106
    const baseOctet = parseInt(baseIP.split('.')[3]); // Ex.: 207
    for (let i = 0; i < maxAttempts; i++) {
        const testIP = `${octet1}.${octet2}.${octet3}.${baseOctet + i}`;
        console.log(`Tentando IP: ${testIP}`);
        try {
            const config = {
                user: process.env.DB_USER || '',
                password: process.env.DB_PASSWORD || '',
                server: testIP,
                database: process.env.DB_NAME || '',
                port: parseInt(process.env.DB_PORT || '1433', 10),
                options: {
                    encrypt: true,
                    trustServerCertificate: true
                },
                connectionTimeout: 5000 // Timeout menor para cada tentativa
            };
            const pool = await sql.connect(config);
            console.log(`Conexão bem-sucedida com IP: ${testIP}`);
            await pool.close();
            return testIP;
        } catch (err) {
            console.log(`Falha ao conectar ao IP ${testIP}:`, err.message);
        }
    }
    throw new Error('Nenhum IP ativo encontrado na faixa');
}

// SQL Server config
async function getDbConfig() {
    const baseIP = process.env.DB_SERVER || '72.10.106.207';
    const activeIP = await findActiveIP(baseIP, process.env.DB_PORT || '1433');
    return {
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        server: activeIP,
        database: process.env.DB_NAME || '',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true,
            trustServerCertificate: true
        },
        connectionTimeout: 30000
    };
}

// Criar pool de conexões
let poolPromise;
async function initializePool() {
    try {
        const dbConfig = await getDbConfig();
        poolPromise = new sql.ConnectionPool(dbConfig)
            .connect()
            .then(pool => {
                console.log('Conexão ao SQL Server estabelecida');
                return pool;
            })
            .catch(err => {
                console.error('Erro ao conectar ao SQL Server:', err);
                process.exit(1);
            });
    } catch (err) {
        console.error('Erro ao inicializar pool:', err);
        process.exit(1);
    }
}

initializePool();

// Test route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Get BuildingWings
app.get('/buildingwings', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM BuildingWing');
        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao consultar BuildingWing:', err);
        res.status(500).send('Database error');
    }
});

// Add Component
app.post('/components', async (req, res) => {
    const { ComponentTypeID, CampusID, FacilityID, BuildingWingID, InstallDate, UniqueTag } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ComponentTypeID', sql.Int, ComponentTypeID)
            .input('CampusID', sql.Int, CampusID)
            .input('FacilityID', sql.Int, FacilityID)
            .input('BuildingWingID', sql.Int, BuildingWingID)
            .input('InstallDate', sql.Date, InstallDate)
            .input('UniqueTag', sql.NVarChar, UniqueTag)
            .query(`
                INSERT INTO Component (ComponentTypeID, CampusID, FacilityID, BuildingWingID, InstallDate, UniqueTag)
                VALUES (@ComponentTypeID, @CampusID, @FacilityID, @BuildingWingID, @InstallDate, @UniqueTag)
            `);
        res.status(200).send('Component added');
    } catch (err) {
        console.error('Erro ao inserir Component:', err);
        res.status(500).send('Database insert error');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
