import express from "express";
import axios from "axios";

const router = express.Router();

// Proxy all requests to https://api.themoviedb.org/3
router.use("/", async (req, res) => {
  try {
    // req.path will be whatever comes after /api/tmdb (e.g., /discover/movie)
    const tmdbUrl = `https://api.themoviedb.org/3${req.path}`;
    
    const response = await axios({
      method: req.method,
      url: tmdbUrl,
      params: req.query,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      },
      data: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("TMDB Proxy Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { message: "Error fetching data from TMDB" }
    );
  }
});

export default router;
