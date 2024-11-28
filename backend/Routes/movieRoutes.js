import express from 'express';
import { getMovieRecommendations, getTMDBMovies } from '../controllers/movieController.js';

const router = express.Router();

router.post('/recommendations', getMovieRecommendations);
router.get('/tmdb/:category', getTMDBMovies);

export default router;