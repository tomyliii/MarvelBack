const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/comics", async (req, res) => {
  try {
    const { limit, page, title } = req.query;
    const skip = limit * (page - 1);

    const comics = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/comics?limit=" +
        limit +
        "&skip=" +
        skip +
        "&apiKey=" +
        process.env.MARVEL_API
    );

    comics.data.results.sort(function (a, b) {
      a.title.localeCompare(b.title);
    });

    return res.status(200).json(comics.data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/comic/:id", async (req, res) => {
  try {
    const comic = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/comic/" +
        req.params.id +
        "?apiKey=" +
        process.env.MARVEL_API
    );

    return res.status(200).json(comic.data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
