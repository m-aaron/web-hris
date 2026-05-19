import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoute.js';
import employeeRoutes from './src/routes/employeeRoute.js';
import personalRoutes from './src/routes/personalRoute.js';
import familyRoutes from './src/routes/familyRoute.js';
import childrenRoutes from './src/routes/childrenRoute.js';
import employmentRoutes from './src/routes/employmentRoute.js';
import educationRoutes from './src/routes/educationRoute.js';
import examRoutes from './src/routes/examRoute.js';
import trainingRoutes from './src/routes/trainingRoute.js';
import historyRoutes from './src/routes/historyRoute.js';
import otherInfoRoutes from './src/routes/otherInfoRoute.js';
import referenceRoutes from './src/routes/referenceRoute.js';
import dashboardRoutes from './src/routes/dashboardRoute.js';
import userRoutes from './src/routes/userRoute.js';
import leaveRoutes from './src/routes/leaveRoutes.js';
import positionRoutes from './src/routes/positionRoutes.js';
import designationRoutes from './src/routes/designationRoutes.js';
import departmentRoutes from './src/routes/departmentRoute.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const frontendOriginsRaw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:3000";

const allowedOrigins = new Set();

const addAllowedOriginVariants = (originValue) => {
    if (!originValue) {
        return;
    }

    const normalized = String(originValue).trim().replace(/\/$/, "");
    if (!normalized) {
        return;
    }

    allowedOrigins.add(normalized);

    try {
        const parsed = new URL(normalized);

        // Allow localhost and 127.0.0.1 variants on the same protocol/port.
        if (parsed.hostname === "localhost") {
            parsed.hostname = "127.0.0.1";
            allowedOrigins.add(parsed.toString().replace(/\/$/, ""));
        } else if (parsed.hostname === "127.0.0.1") {
            parsed.hostname = "localhost";
            allowedOrigins.add(parsed.toString().replace(/\/$/, ""));
        }
    } catch {
        // Ignore malformed origin value.
    }
};

frontendOriginsRaw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach(addAllowedOriginVariants);

app.use(cors({
    origin(origin, callback) {
        // Allow server-to-server or non-browser requests without Origin.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // allow cookies
}));
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(cookieParser());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', personalRoutes);
app.use('/api/employees', familyRoutes);
app.use('/api/employees', childrenRoutes);
app.use('/api/employees', employmentRoutes);
app.use('/api/employees', educationRoutes);
app.use('/api/employees', examRoutes);
app.use('/api/employees', trainingRoutes);
app.use('/api/employees', historyRoutes);
app.use('/api/employees', otherInfoRoutes);
app.use('/api/employees', referenceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});