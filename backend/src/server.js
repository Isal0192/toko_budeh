import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Pindahkan ke atas
import { fileURLToPath } from 'url'; // Pindahkan ke atas
import apiRouter from './routes/api.js';

// 1. Definisikan path SEBELUM digunakan
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware Global
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Serve Static Files
// Asumsi: 'dist' berada sejajar dengan folder 'src' (naik 1 level dari server.js)
app.use(express.static(path.join(__dirname, '../../dist')));

// Arahkan /uploads ke folder backend/public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 4. API Routes
app.use('/api', apiRouter);

// 5. Catch-all Route untuk React (HARUS DI BAWAH API ROUTES)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

export default app;
