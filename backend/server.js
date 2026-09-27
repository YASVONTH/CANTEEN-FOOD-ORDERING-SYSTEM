import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Adjust to specific frontend domain (e.g., GitHub Pages URL) in production
    }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteenhub';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('io', io);

// Serve frontend static files
const frontendDistPath = path.resolve('../frontend/dist');
app.use('/canteenhub', express.static(frontendDistPath));

// Fallback for single-page app routing (only if file exists)
app.get(/^\/canteenhub\/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send("CanteenHub API is running. The frontend is hosted separately on Vercel.");
        }
    });
});

// Default route redirect
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the CanteenHub API. The server is online and running!" });
});

import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
