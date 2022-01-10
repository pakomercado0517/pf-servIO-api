const { Router } = require("express");
const router = Router();
const userFunctions = require("../controllers/index.js");
const passport = require("passport");
const { User } = require("../db");
const enviarEmail = require("../handlers/email");
const constants = {
  localhost: "http://localhost:3001",
  surge: "https://serv-io.surge.sh",
};

require("../config/googleConfig");

let googleData = [];
let githubData = [];

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send("Inicia sesion");
  }
}

// router.post("/", userFunctions.newUser);
router.post(
  "/",
  async (req, res, next) => {
    const { email } = req.body;
    let user = await User.findOne({ where: { email } });

    if (user) {
      res.status(200).send({ message: "Usuario existente" });
    } else {
      next();
    }
  },
  passport.authenticate("local-signup", {
    // failureRedirect: "/user/register",
    failureFlash: true,
  }),
  async (req, res, next) => {
    console.log(2);
    // res.redirect(`/user/${req.user.id}`);
    res.status(200).send({ message: "Usuario creado" });
    next();
    (req, res) => {
      res.redirect(`/user/${req.user.id}`);
    };
  },
  async (req, res, next) => {
    const usuario = await User.findOne({ where: { email: req.body.email } });
    const activateUrl = `${constants.surge}/activate/${usuario.token}`;
    await enviarEmail.enviar({
      usuario,
      subject: "Activate Account",
      activateUrl,
      archivo: `<h2>Activar Cuenta</h2><p>Hola, acabas de registrarte en Servio, estás a un paso de poder usar tu cuenta,  haz click en el siguiente enlace para activarla, este enlace es temporal, en caso de vencer vuelve a solicitarlo </p><a href=${activateUrl} >Activa tu cuenta</a><p>Si no puedes acceder a este enlace, visita ${activateUrl}</p><div/>`,
    });

    // next();
    // (req, res) => {
    //   console.log(3)
    //   res.redirect(`/user/${req.user.id}`);
    // };
  },
  (req, res, next) => {
    // console.log(4)
    res.status(200).send({ message: "Usuario creado" });
    // console.log(5)
  }
);

router.post(
  "/login",
  passport.authenticate("local-login", {
    // failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res, next) => {
    console.log(req.flash("error"));
    res.send({
      message: "Logged",
      cookies: req.session,
      userType: req.user.professional ? "Professional" : "Normal User",
      data: req.user,
    });
  }
);

router.get("/created/:email", async (req, res, next) => {
  const { email } = req.params;
  if (email) {
    // res.send(email)
    let user = await User.findOne({ where: { email } });
    // res.send(user)
    if (!user) {
      res.send(true);
    } else {
      res.send(false);
    }
  }
});

router.post("/getGoogleUser", userFunctions.googleLog);

// router.get("/getGoogleUser", async (req, res, next) => {
//   await res.json(googleData);
// if (req.isAuthenticated()) {
//   const userResult = await User.findOne({
//     where: { email: req.user._json.email },
//   });
//   res.send({
//     message: "Logged",
//     cookies: req.session,
//     data: userResult,
//   });
// } else {
//   res.send("Inicia Sesión");
// }
// });

router.post("/getGithubUser", userFunctions.githubLog);
router.post("/getFacebookUser", userFunctions.facebookLog);

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook"),
  async (req, res) => {
    cacheData.pop();
    const data = await User.findOne({ where: { email: req.user._json.email } });
    cacheData.push({
      message: "Logged",
      cookies: req.session,
      data: data,
    });
    res.redirect(`${constants.surge}/login`);
  }
);

router.get("/auth/github", passport.authenticate("github", { scope: "user" }));

router.get(
  "/auth/github/callback",
  passport.authenticate("github"),
  async (req, res, next) => {
    githubData.pop();
    const userResult = await User.findOne({
      where: { user_name: req.user._json.login },
    });
    if (userResult) {
      await githubData.push({
        message: "Logged",
        cookies: req.session,
        data: userResult,
      });
    }
    res.redirect(`${constants.surge}/login`);
  }
  // userFunctions.githubAuth
);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  async (req, res) => {
    googleData.pop();
    // console.log("req.user", req.user._json);
    const userResult = await User.findOne({
      where: { email: req.user._json.email },
    });
    if (userResult) {
      await googleData.push({
        message: "Logged",
        cookies: req.session,
        data: userResult,
      });
      res.redirect(`${constants.surge}/login`);
      // await res.json({
      //   message: "Logged",
      //   cookies: req.session,
      //   data: req.user,
      // });
    }
  }
);

router.post("/logout", userFunctions.logOut);

// router.post("/", userFunctions.newUser);
// router.post("/login", userFunctions.login);
// router.post("/logout", userFunctions.logOut);
router.put("/updateUser/:id", userFunctions.updateProfile);
// router.get("/logged", userFunctions.loginTest);
router.get("/logged", userFunctions.loginTestPassport);
// router.get('/home', userFunctions.redirectLogin, userFunctions.redirectHome)
router.get("/perfil", userFunctions.getUser);
router.get("/all", userFunctions.getAllUsers);
router.get("/common", userFunctions.getAllCommonUsers);
router.get("/city", userFunctions.getAllCities);
router.get("/professionals", userFunctions.getAllProfessionals);
router.get("/:id", userFunctions.getByUserId);
router.delete("/:id", userFunctions.deleteByUserId);
router.post("/reenviar", userFunctions.solicitarActivar);
router.post("/reestablecer", userFunctions.enviarToken);
router.get("/reestablecer/:token", userFunctions.validarToken);
router.put("/reestablecer/:token", userFunctions.actualizarPassword);
router.put("/activar/:token", userFunctions.activarCuenta);
module.exports = router;
