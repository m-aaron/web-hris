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
import educationalQualificationRoutes from './src/routes/educationalQualificationRoute.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // allow cookies
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', personalRoutes);
app.use('/api/employees', familyRoutes);
app.use('/api/employees', childrenRoutes);
app.use('/api/employees', employmentRoutes);
app.use('/api/employees', educationalQualificationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});