const { Router } = require("express");
const router = Router();
const functions = require("../controllers/MercadoPago");
const { FRONT_URL } = process.env;

// POST
router.post("/", functions.newTransaction);

// GET
router.get("/succes", functions.succesTransaction);

router.get("/pending", (req, res) => {
  console.log(req.query);
  res.redirect(`${FRONT_URL}`);
});

router.get("/failure", (req, res) => {
  console.log(req.query);
  res.redirect(`${FRONT_URL}/cart`);
});

module.exports = router;
