import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import movieRoutes from './Routes/movieRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/movies', movieRoutes);

const PORT =  5000;

app.listen(PORT, () => {
  console.log(`Server running on port 5000}`);
});