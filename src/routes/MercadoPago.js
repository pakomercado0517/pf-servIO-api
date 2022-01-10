const { Router } = require("express");
const router = Router();
const functions = require("../controllers/MercadoPago");
const constants = {
  localhost: "http://localhost:3001",
  surge: "https://serv-io.surge.sh",
};

// POST
router.post("/", functions.newTransaction);

// GET
router.get("/succes", functions.succesTransaction);

router.get("/pending", (req, res) => {
  console.log(req.query);
  res.redirect(`${constants.surge}`);
});

router.get("/failure", (req, res) => {
  console.log(req.query);
  res.redirect(`${constants.surge}/cart`);
});

module.exports = router;
