const User = require("../Models/User");

const isUserAuthentificated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const sentToken = req.headers.authorization.replace("Bearer ", "");
      const findUser = await User.findOne({ token: sentToken });

      if (findUser) {
        req.user = findUser;
        return next();
      } else {
        return res.status(401).json({ message: "Non autorisé" });
      }
    } else {
      return res.status(401).json({ message: "Non autorisé" });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(400).json({ message: "Mauvaise requête." });
    }
  }
};

module.exports = isUserAuthentificated;
