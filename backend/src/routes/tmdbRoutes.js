import express from "express";
import axios from "axios";
import https from "https";

const router = express.Router();

// Proxy all requests to https://api.themoviedb.org/3
router.use("/", async (req, res) => {
  try {
    // req.path will be whatever comes after /api/tmdb (e.g., /discover/movie)
    const tmdbUrl = `https://api.tmdb.org/3${req.path}`;
    
    // Using api.tmdb.org which often bypasses ISP blocking of api.themoviedb.org
    const response = await axios({
      method: req.method,
      url: tmdbUrl,
      params: req.query,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      },
      data: req.method !== 'GET' ? req.body : undefined
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("TMDB Proxy Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { message: "Error fetching data from TMDB", error: error.message }
    );
  }
});

export default router;
