import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';

const genAI = new GoogleGenerativeAI("AIzaSyAmYoFAc4_hkk2HOa1vSlLwEUTx-dXod5U");

export const getMovieRecommendations = async (req, res) => {
    const { query } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
        
        const prompt = `Act as a movie recommendation system. Based on this criteria: "${query}", suggest 5 movies.
                       Return the response ONLY as a JSON array of movie titles.
                       Example format: ["Movie 1", "Movie 2", "Movie 3", "Movie 4", "Movie 5"], atleast 14 movies`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            const cleanedText = text.replace(/```json|```/g, '').trim();
            const movieTitles = JSON.parse(cleanedText);
            
            if (!Array.isArray(movieTitles)) {
                throw new Error('Response is not an array');
            }

            const moviePromises = movieTitles.map(async (title) => {
                try {
                    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=6edc27994f4bd91777c2f71dcfbe8b5c&query=${encodeURIComponent(title)}`;
                    const response = await fetch(searchUrl);
                    const data = await response.json();
                    return data.results[0] || null;
                } catch (error) {
                    console.error(`Error fetching details for ${title}:`, error);
                    return null;
                }
            });

            const movieDetails = await Promise.all(moviePromises);
            const validMovies = movieDetails.filter(movie => movie !== null);
            
            if (validMovies.length === 0) {
                return res.status(404).json({ error: 'No valid movies found' });
            }
            
            res.status(200).json(validMovies);
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError, 'Raw text:', text);
            res.status(500).json({ error: 'Invalid response format from AI' });
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Error getting movie recommendations' });
    }
};

export const getTMDBMovies = async (req, res) => {
    const { category } = req.params;
    
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${category}?api_key=6edc27994f4bd91777c2f71dcfbe8b5c&language=en-US&page=1`
        );
        const data = await response.json();
        res.status(200).json(data.results);
    } catch (error) {
        console.error('Error fetching TMDB movies:', error);
        res.status(500).json({ error: 'Error fetching movies' });
    }
};