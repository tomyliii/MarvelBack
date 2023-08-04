const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/characters", async (req, res) => {
  try {
    const { limit, page, title } = req.query;
    const skip = limit * (page - 1);

    const characters = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/characters?limit=" +
        limit +
        "&skip=" +
        skip +
        "&apiKey=" +
        process.env.MARVEL_API
    );

    return res.status(200).json(characters.data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/character/:id", async (req, res) => {
  try {
    const infosCharactere = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/character/" +
        req.params.id +
        "?apiKey=" +
        process.env.MARVEL_API
    );
    const comicsWithCharacter = await axios.get(
      "https://lereacteur-marvel-api.herokuapp.com/comics/" +
        req.params.id +
        "?apiKey=" +
        process.env.MARVEL_API
    );
    return res.status(200).json({
      character: infosCharactere.data,
      comics: comicsWithCharacter.data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
