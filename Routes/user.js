const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const User = require("../Models/User");
const fileUpload = require("express-fileupload");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const base64 = require("crypto-js/enc-base64");
const convertToBase64 = require("../Tools/convertToBase64");
const isUserAuthentificated = require("../middelware/isUserAuthentificated");
const axios = require("axios");
router.post("/user/createaccount", fileUpload(), async (req, res) => {
  try {
    const { lastname, firstname, nickname, mail, password, dateOfBirth } =
      req.body;
    if (lastname && firstname && nickname && mail && password && dateOfBirth) {
      if (await User.findOne({ mail })) {
        return res
          .status(409)
          .json({ message: "L'adresse e-mail est déjà utilisée." });
      }

      const capitalize = (value) => {
        const newString =
          value[0].toUpperCase() + value.toLowerCase().substring(1);
        return newString;
      };

      const salt = uid2(16);
      const token = uid2(16);
      const hash = SHA256(password + salt).toString(base64);
      const newUser = new User({
        firstname: capitalize(firstname),
        lastname: capitalize(lastname),
        nickname: capitalize(nickname),
        mail,
        dateOfBirth: new Date(dateOfBirth),
        salt,
        hash,
        token,
      });

      if (req.files?.productImg) {
        const avatar = await cloudinary.uploader.upload(
          convertToBase64(req.files.productImg),
          {
            folder: `/marvel/user/${newUser.id}`,
            public_id: `avatar_${newUser.id}`,
          }
        );
        newUser.avatar = { secure_url: avatar.secure_url };
      } else {
        const avatar = await cloudinary.api.resources({
          type: "upload",
          prefix: "marvel/user/default",
        });

        const randomNumber = Number(
          Math.floor(Math.random() * avatar.resources.length)
        );

        newUser.avatar.secure_url = avatar.resources[randomNumber].secure_url;
      }

      await newUser.save();

      res.status(200).json({ message: "Votre compte a bien été créé.", token });
    } else {
      return res.status(400).json({ message: "Donnée(s) manquante(s)" });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { password, mail } = req.body;
    if (password && mail) {
      const findedUser = await User.findOne({ mail: mail.toUpperCase() });

      if (findedUser) {
        const newHash = SHA256(password + findedUser.salt).toString(base64);

        if (newHash === findedUser.hash) {
          return res.status(200).json({
            message: "Vous êtes connecté(e)",
            token: findedUser.token,
            nickname: findedUser.nickname,
          });
        } else {
          res.status(401).json({ message: "Non autorisé." });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Adresse e-mail et/ou mot de passe incorrecte(s)" });
      }
    } else {
      return res.status(400).json({ message: "Donnée(s) manquante(s)" });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.get("/user", isUserAuthentificated, async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.get("/favorites", isUserAuthentificated, async (req, res) => {
  try {
    const user = req.user;
    const favorites = {};
    const favoritesCharacters = [];
    const favoritesComics = [];
    if (user.favorites.characters.length !== 0) {
      const arrayOfCharacters = user.favorites.characters.map((character) => {
        return axios.get(
          "https://lereacteur-marvel-api.herokuapp.com/character/" +
            character +
            "?apiKey=" +
            process.env.MARVEL_API
        );
      });
      const resulteCharacters = await Promise.all(arrayOfCharacters);

      resulteCharacters.forEach((response) => {
        favoritesCharacters.push(response.data);
      });

      favorites.characters = favoritesCharacters;
    } else {
      favorites.characters = [];
    }
    if (user.favorites.comics.length !== 0) {
      const arrayOfComics = user.favorites.comics.map((comic) => {
        return axios.get(
          "https://lereacteur-marvel-api.herokuapp.com/comic/" +
            comic +
            "?apiKey=" +
            process.env.MARVEL_API
        );
      });
      const resulteComics = await Promise.all(arrayOfComics);
      resulteComics.forEach((response) => {
        favoritesComics.push(response.data);
      });

      favorites.comics = favoritesComics;
    } else {
      favorites.comics = [];
    }

    return res.status(200).json(favorites);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.put("/favoritesManage", isUserAuthentificated, async (req, res) => {
  const { token, character, comic } = req.body;
  const user = req.user;
  try {
    if (token === user.token) {
      if (character) {
        if (user.favorites.characters.includes(character)) {
          const indexOfCharactere =
            user.favorites.characters.indexOf(character);
          user.favorites.characters.splice(indexOfCharactere, 1);
        } else {
          user.favorites.characters.push(character);
        }
      }
      if (comic) {
        if (user.favorites.comics.includes(comic)) {
          const indexOfComic = req.user.favorites.comics.indexOf(comic);
          req.user.favorites.comics.splice(indexOfComic, 1);
        } else {
          user.favorites.comics.push(comic);
        }
      }
      await user.save();
      return res.status(200).json({ message: "Favori mis à jour." });
    } else {
      return res.status(401).json({
        message: "Vous n'êtes pas autorisé(e) à ajouter un favori à ce compt.",
      });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
