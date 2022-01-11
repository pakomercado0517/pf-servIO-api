// @ts-ignore
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const passport = require("passport");
const enviarEmail = require("../handlers/email");
const crypto = require("crypto");
const saltRounds = 10;
const { FRONT_URL } = process.env;
// var juice = require("juice");
// @ts-ignore
const {
  User,
  Profession,
  Professional,
  ProfessionalOffer,
  ClientNeed,
  SpecificTechnicalActivity,
  Transactions,
  Profession_Professional,
  ClientReview,
} = require("../db.js");
const e = require("express");

module.exports = {
  newUser: async (req, res) => {
    const {
      // userName,
      firstName,
      lastName,
      email,
      phone,
      city,
      // state,
      photo,
      dni,
      password,
      verified,
      professional,
      certification_name,
      certification_img,
      status,
      profession,
    } = req.body;
    console.log(req.body);

    error = [];

    // if(!userName || !firstName || !lastName || !email || !phone || !city || !state  || !dniFront|| !dniBack || !password || !password2 ){
    //     error.push({message: 'Please enter all the required fields'})
    // }
    // if(password.length < 6){
    //     error.push({message: 'Password should be at least 6 characters'})
    // }
    // if(password !== password2){
    //     error.push({message: 'The password do not match'})
    // }

    const users = await User.findAll({
      include: [{ model: Professional }],
    });

    users.map((e) => {
      if (e.email === email) {
        error.push("Email already in use");
      }
      // if(e.userName === userName){
      //     error.push( 'User already in use')
      // }
    });

    if (error.length > 0) {
      res.send(error);
    } else {
      try {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = await User.create({
          user_name: userName,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone ? phone : 00000000,
          city,
          state,
          photo: photo ? photo : "",
          dni,
          // dni_back:dniBack ? dniBack : '',
          password: hashedPassword,
          verified: verified ? verified : false,
          professional,
        });

        if (professional === "true") {
          let newProfessional = await Professional.create({
            // certification_name:certification_name ? certification_name: '',
            // certification_img:certification_img ? certification_img : '',
            // status : status ? status : 'normal',
            certification_name,
            certification_img,
            status,
          });
          let professions = profession.toLowerCase();
          if (typeof professions === "string") {
            professions = professions.split(",");
          }

          const allProfessions = await Profession.findAll({
            where: {
              name: {
                [Op.in]: Array.isArray(professions)
                  ? professions
                  : [professions],
              },
            },
          });

          await newProfessional.setProfessions(allProfessions);
          await newUser.setProfessional(newProfessional);
        }
        res
          .status(200)
          .send(
            `You are now registered, ${
              firstName + " " + lastName
            } please log in`
          );
      } catch (error) {
        res.status(400).send(error.response);
      }
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findAll({
        where: { email },
      });

      let userType = "";
      if (user.length < 1) {
        res.status(200).send("Mail doesn't exist");
      }
      if (user[0].professional === true) {
        userType = "Professional";
      } else {
        userType = "Client";
      }

      if (user.length > 0) {
        bcrypt.compare(password, user[0].password, (err, isMatch) => {
          if (err) {
            res.status(200).send("error");
            throw err;
          }
          if (isMatch) {
            req.session.userId = user[0].id;
            let obj = { message: "Logged", cookies: req.session, userType };
            return res.send(obj);
          } else {
            res.send("Wrong passWord");
          }
        });
      }
      if (user.length < 0) {
        res.status(200).send("Something is wrong");
      }
    } catch (error) {
      // res.status(400).send(error.message)/
    }
  },
  loginTest: async (req, res) => {
    if (req.session.userId) {
      res.send(true);
    } else {
      res.send(false);
    }
  },
  logginData: async (req, res, next) => {
    let professional = await User.findOne({});
    res.send(req.user?.id);
  },
  loginTestPassport: (req, res) => {
    if (req.isAuthenticated()) {
      res.send(true);
    } else {
      res.send(false);
    }
  },

  redirectLogin: async (req, res, next) => {
    if (!req.session.userId) {
      res.send("/login");
    } else {
      next();
    }
  },

  redirectHome: (req, res, next) => {
    if (req.session.userId) {
      res.send("dentro");
    } else {
      next();
    }
  },

  // logOut: (req, res, next) => {
  //   req.session.destroy((err) => {
  //     if (err) {
  //       res.send("Logout Failed");
  //     }
  //     res.clearCookie("sid");
  //     res.send("Logged Out");
  //   });
  // },
  logOut: (req, res) => {
    req.logout();
    res.send("logged out");
  },
  getUser: async (req, res) => {
    const { userId } = req.body;
    console.log(req.session);
    if (userId) {
      const user = await User.findAll({
        where: {
          id: parseInt(userId),
        },
        include: [{ model: ClientNeed }],
      });
      if (user.length > 0) {
        res.send(user);
      }
    } else {
      res.send("Please join in");
    }
  },

  newTechnicalActivity: async (req, res) => {
    const {
      name,
      price,
      photo,
      materials,
      description,
      guarantee,
      guarantee_time,
      job_time,
      type,
      userId,
    } = req.body;

    try {
      let activityFromProfession = await SpecificTechnicalActivity.create({
        name,
        price,
        photo,
        materials,
        description,
        guarantee,
        type: type ? type : "general",
        guarantee_time,
        job_time,
      });

      let professional = await Professional.findAll({
        where: { UserId: userId },
      });
      await activityFromProfession.setProfessional(professional[0]);
      res.status(200).send(activityFromProfession);
    } catch (error) {
      res.status(400).send(error.message);
    }
    // }
  },

  // ******** OTHER

  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        include: [{ model: ClientReview }],
      });
      const rate = users.map((r) => {
        if (r.ClientReviews !== []) {
          let userRate = 0;
          for (let i = 0; i < r.ClientReviews?.length; i++) {
            userRate += parseInt(r.ClientReviews[i].score);
          }
          let average =
            Math.round((userRate / r.ClientReviews?.length) * 100) / 100;
          r.rate = average;
          return r;
        } else {
          r.rate = 0;
          return r;
        }
      });
      res.status(200).send(rate);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getAllProfessionals: async (req, res) => {
    try {
      // const reviews = await ClientReview.findAll({

      // })
      const professionals = await User.findAll({
        where: {
          professional: true,
        },
        include: [
          {
            model: Professional,
            include: [
              { model: Profession },
              { model: ClientReview },
              { model: SpecificTechnicalActivity },
            ],
          },
        ],
      });
      const rate = professionals.map((r) => {
        if (r.Professional.ClientReviews !== []) {
          let userRate = 0;
          for (let i = 0; i < r.Professional.ClientReviews?.length; i++) {
            userRate += parseInt(r.Professional.ClientReviews[i].score);
          }
          let average = userRate / r.Professional.ClientReviews?.length;
          // let userRate2 = {userRate : average}
          r.rate = average;
          return r;
        } else {
          // let userRate2 = {userRate : 0}
          r.rate = 0;
          return r;
        }
      });
      res.status(200).send(rate);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getAllCommonUsers: async (req, res) => {
    try {
      const commonUsers = await User.findAll({
        where: {
          professional: false,
        },
        include: [{ model: ClientNeed }],
      });
      res.status(200).send(commonUsers);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getByUserId: async (req, res) => {
    try {
      const id = req.params.id;
      let user = await User.findAll({
        where: { id: { [Op.eq]: id } },
      });
      if (user[0] && user.professional === true) {
        const users = await User.findOne({
          where: { id },
          include: [
            {
              model: Professional,
              include: [
                { model: Profession },
                { model: ClientReview },
                { model: SpecificTechnicalActivity },
              ],
            },
          ],
        });

        if (users.Professional.ClientReviews.length) {
          let userRate = 0;
          for (let i = 0; i < users.Professional.ClientReviews.length; i++) {
            userRate += parseInt(users.Professional.ClientReviews[i].score);
          }
          let average =
            Math.round(
              (userRate / users.Professional.ClientReviews?.length) * 100
            ) / 100;
          users.rate = average;
        } else {
          users.rate = 0;
        }

        await users.save();
        res.status(200).send([users]);
      } else if (user[0]) {
        const users = await User.findOne({
          where: { id },
          include: [
            {
              model: Professional,
              include: [
                { model: Profession },
                { model: ClientReview },
                { model: SpecificTechnicalActivity },
              ],
            },
          ],
        });
        res.status(200).send([users]);
      } else {
        res.status(200).send("El usuario no existe.");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getUserByActivityName: async (req, res) => {
    const { name } = req.body;
    try {
      const activities = await SpecificTechnicalActivity.findAll({
        include: [
          {
            model: Professional,
            include: [{ model: Profession }],
          },
        ],
        where: { name: { [Sequelize.Op.iLike]: `%${name}%` } },
      });
      const ids = await activities.map((e) => e.Professional.UserId);
      let uniqueArr = [...new Set(ids)];
      let arrUsers = [];
      for (let i = 0; i < uniqueArr.length; i++) {
        arrUsers.push(
          await User.findAll({
            where: { id: uniqueArr[i] },
          })
        );
      }
      res.status(200).send(arrUsers);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getAllActivities: async (req, res) => {
    try {
      const activities = await SpecificTechnicalActivity.findAll({
        include: [
          {
            model: Professional,
            include: [{ model: Profession }],
            include: [{ model: User }],
          },
          {
            model: ClientNeed,
          },
        ],
      });
      res.status(200).send(activities);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getByActivityName: async (req, res) => {
    try {
      const activities = await SpecificTechnicalActivity.findAll({
        include: [
          {
            model: Professional,
            include: [{ model: Profession }],
          },
        ],
        where: { name: { [Sequelize.Op.iLike]: `%${req.body.name}%` } },
      });
      res.status(200).send(activities);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  // ************ CLIENT NEEDS

  // getByProfessionName: async (req, res) =>{
  //     const {profession} = req.body
  //     const professionalArr = profession.split(',')
  //     try {
  //         const professionals = await Professional.findAll({
  //             include:[{
  //                 model: Profession
  //             }],
  //         })

  // ************ PROFESSIONAL OFFERS

  //CONDICIONAR QUE SOLO PUEDAN OFERTAR PROFESIONALES

  // ************ USER

  updateProfile: async (req, res) => {
    const {
      // userName,
      firstName,
      lastName,
      email,
      phone,
      city,
      state,
      photo,
      dni,
      password,
      // verified,
      professional,
      certification_name,
      certification_img,
      status,
      profession,
    } = req.body;
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });
    let x = false;
    if (user.email !== email) {
      user.verified = false;
      user.token = crypto.randomBytes(20).toString("hex");
      user.expiracion = Date.now() + 3600000;
      await user.save();
      x = true;
    }
    // console.log(user)
    try {
      let newPass = await bcrypt.hash(password, 10);
      await User.update(
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          city,
          state,
          photo,
          dni,
          password: newPass,
          professional,
        },
        { where: { id: id } }
      );
      await Professional.update(
        {
          certification_name,
          certification_img,
          status,
        },
        { where: { UserId: id } }
      );

      let prof = await Professional.findOne({
        where: { UserId: id },
      });
      let professionalId = prof.id;
      await Profession_Professional.destroy({
        where: { ProfessionalId: professionalId },
      });

      //   const findProfession = await Profession.findAll({
      //     where: { name: profession },
      //   });
      let professions = profession;
      if (typeof professions === "string") {
        professions = professions.split(",");
      }

      const allProfessions = await Profession.findAll({
        where: {
          name: {
            [Op.in]: Array.isArray(professions) ? professions : [professions],
          },
        },
      });
      await prof.setProfessions(allProfessions);
      if (x === true) {
        const usuario = await User.findOne({ where: { id } });
        const activateUrl = `${FRONT_URL}/activate/${usuario.token}`;
        await enviarEmail.enviar({
          usuario,
          subject: "Activar con nuevo email",
          activateUrl,
          archivo: `<h2>Activar cuenta</h2><p>Hola, has modificado tu mail, haz click en el siguiente enlace para reactivar tu cuenta, este enlace es temporal, en caso de vencer vuelve a solicitarlo </p><a href=${resetUrl} >Resetea tu password</a><p>Si no puedes acceder a este enlace, visita ${resetUrl}</p><div/>`,
        });
      }
      res.send("updated");
    } catch (error) {
      res.send(error.message);
    }
  },
  test: async (req, res) => {
    const { id } = req.body;

    res.send("borrado");
  },

  deleteProfessionalActivity: async (req, res) => {
    const id = req.params.id;
    if (id) {
      const specificActivity = await SpecificTechnicalActivity.findOne({
        where: { id },
      });
      if (specificActivity) {
        specificActivity.destroy();
        res.status(200).send("La actividad especifica ha sido eliminada.");
      } else {
        res.status(404).send("specific activity not found");
      }
    } else {
      res.status(500).send("Por favor inserta un id.");
    }
  },

  getProfessionalActivities: async (req, res) => {
    const id = req.params.id;
    try {
      if (id) {
        const professional = await Professional.findOne({
          where: { UserId: id },
        });
        if (professional) {
          const professionalId = professional.id;
          const activities = await SpecificTechnicalActivity.findAll({
            where: { ProfessionalId: professionalId },
            include: [{ model: ClientNeed }],
          });
          if (activities.length > 0) {
            res.status(200).send(activities);
          } else {
            res.status(200).send("There are not specifical Activities");
          }
        } else {
          res.status(200).send("There are not specifical Activities");
        }
      } else {
        res.status(200).send("There are not specifical Activities");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  enviarToken: async (req, res) => {
    const { email } = req.body;
    if (email) {
      const usuario = await User.findOne({ where: { email } });
      console.log(usuario);
      if (!usuario) {
        res.send({ message: "No existe esa cuenta" });
      } else {
        if (usuario.token === null) {
          usuario.token = crypto.randomBytes(20).toString("hex");
          usuario.expiracion = Date.now() + 3600000;
        }
        //guardarlos en la base de datos
        await usuario.save();

        //url de reset
        const resetUrl = `${FRONT_URL}/forget-password/${usuario.token}`;
        const activeUrl = ` ${FRONT_URL}/activate/${usuario.token}`;
        //Enviar correo con el token

        // console.log(email, type)
        if (usuario.verified === true) {
          await enviarEmail.enviar({
            usuario,
            subject: "Password Reset",
            resetUrl,
            archivo: `<h2>Restablecer Password</h2><p>Hola, has solicitado reestablecer tu password, haz click en el siguiente enlace para reestablecerlo, este enlace es temporal, en caso de vencer vuelve a solicitarlo </p><a href=${resetUrl} >Resetea tu password</a><p>Si no puedes acceder a este enlace, visita ${resetUrl}</p><div/>`,
          });
        } else {
          await enviarEmail.enviar({
            usuario,
            subject: "Verify your account",
            activeUrl,
            archivo: `<h2>Activar tu cuenta</h2><p>Hola, has solicitado reestablecer tu password, lamentablemente tu cuenta no se encuentra activada, por favor activala primero, para ello  haz click en el siguiente enlace, este enlace es temporal, en caso de vencer vuelve a solicitarlo </p><a href=${activeUrl} >Activa tu cuenta</a><p>Si no puedes acceder a este enlace, visita ${activeUrl}</p><div/>`,
          });
        }
        res.send({ message: "Se envio un mensaje a tu correo" });
      }
    } else {
      res.send({ message: "Envia un email valido" });
    }
  },

  validarToken: async (req, res) => {
    const usuario = await User.findOne({
      where: {
        token: req.params.token,
      },
    });

    if (!usuario) {
      res.send(false);
    } else {
      res.send(true);
    }
  },

  actualizarPassword: async (req, res) => {
    const { password } = req.body;
    const usuario = await User.findOne({
      where: {
        token: req.params.token,
        expiracion: {
          [Op.gte]: Date.now(),
        },
      },
    });

    if (!usuario) {
      // req.flash("error", "No valido"),
      res.send("INVALIDO");
    } else {
      usuario.password = bcrypt.hashSync(
        Object.keys(req.body)[0],
        bcrypt.genSaltSync(10)
      );
      usuario.token = null;
      usuario.expiracion = null;
      console.log(Object.keys(req.body)[0]);
      //guardar nuevo password
      await usuario.save();
      res.send("Password Restored");
    }
  },

  solicitarActivar: async (req, res) => {
    const { email } = req.body;
    if (email) {
      const usuario = await User.findOne({ where: { email } });
      // console.log(usuario)
      if (!usuario) {
        res.send({ message: "No existe esa cuenta" });
      } else {
        if (usuario.token === null) {
          usuario.token = crypto.randomBytes(20).toString("hex");
          usuario.expiracion = Date.now() + 3600000;
          await usuario.save();
        }

        //url de reset
        const activeUrl = ` ${FRONT_URL}/activate/${usuario.token}`;
        //Enviar correo con el token

        // console.log(email, type)
        await enviarEmail.enviar({
          usuario,
          subject: "Verify your account",
          activeUrl,
          archivo: `<h2>Verifica tu cuenta</h2><p>Hola, has solicitado que reenviemos el mail para activar tu cuenta, haz click en el siguiente enlace para activar tu cuenta, este enlace es temporal, en caso de vencer vuelve a solicitarlo </p><a href=${activeUrl} >Activa tu cuenta</a><p>Si no puedes acceder a este enlace, visita ${activeUrl}</p><div/>`,
        });

        res.send({ message: "Se envio un mensaje a tu correo" });
      }
    } else {
      res.send({ message: "Envia un email valido" });
    }
  },
  activarCuenta: async (req, res) => {
    const usuario = await User.findOne({
      where: {
        token: req.params.token,
        expiracion: {
          [Op.gte]: Date.now(),
        },
      },
    });
    if (!usuario) {
      // req.flash("error", "No valido"),
      res.send("INVALIDO");
    } else {
      (usuario.verified = true), (usuario.token = null);
      usuario.expiracion = null;
      await usuario.save();
      res.send("Cuenta Activada");
    }
  },

  deleteByUserId: async (req, res) => {
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });
    user.destroy();
    res.send(
      `El usuario ${user.first_name + " " + user.last_name}  ha sido eliminado.`
    );
  },

  //     } catch (error) {
  //         // res.status(400).send(error.message)
  //     }
  // },
  googleSignin: async (req, res, next) => {
    const profile = await req.user._json;
    console.log("user", profile);
    const user = await User.findOne({ where: { email: profile.email } });
    if (user) {
      res.status(200).send({
        message: "Logged",
        cookies: req.session,
        userType: user.professional ? "Professional" : "Normal User",
        data: user,
      });
    }
    if (!user) {
      let registerUser = await User.create({
        first_name: profile.given_name,
        last_name: profile.family_name,
        photo: profile.picture,
        email: profile.email,
        verified: profile.email_verified,
        professional: false,
      });
      console.log("Se inició con exito, esta es la información", req.session);
      res.status(200).send({
        message: `Registered with id: ${registerUser.id}`,
        cookies: req.session,
        userType: "Normal User",
        data: registerUser,
      });
    }
    next();
  },

  updateActivity: async (req, res) => {
    const {
      name,
      price,
      photo,
      materials,
      description,
      guarantee,
      guarantee_time,
      job_time,
    } = req.body;
    const id = req.params.id;
    try {
      const activity = await SpecificTechnicalActivity.findOne({
        where: { id },
      });

      if (activity) {
        activity.name = name ? name : activity.name;
        activity.price = price ? price : activity.price;
        activity.photo = photo ? photo : activity.photo;
        activity.materials = materials ? materials : activity.materials;
        activity.description = description ? description : activity.description;
        activity.guarantee = guarantee ? guarantee : activity.guarantee;
        activity.guarantee_time = guarantee_time
          ? guarantee_time
          : activity.guarantee_time;
        activity.job_time = job_time ? job_time : activity.job_time;
        await activity.save();

        res.status(200).send(activity);
      } else {
        res.status(400).send("Inserta Id de actividad existente");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  githubAuth: async (req, res) => {
    const user = req.user._json;
    const name = user.name.split(" ");
    const findUser = await User.findOne({ where: { email: user.login } });
    if (findUser) {
      res.redirect(`${FRONT_URL}/login`);
    } else {
      User.create({
        first_name: user.name[0],
        last_name: user.name[1],
        email: user.login,
        photo: user.avatar_url,
        professional: false,
      });
      res.redirect(`${FRONT_URL}/login`);
    }
  },
  getAllCities: async (req, res) => {
    const users = await User.findAll({});
    let cities = [];
    users.map((e) => {
      if (cities.indexOf(e.city) === -1) cities.push(e.city);
    });

    res.send(cities);
  },
  githubLog: async (req, res, next) => {
    const {
      userName,
      firstName,
      lastName,
      email,
      photo,
      certification_name,
      certification_img,
    } = req.body;
    try {
      const findGithubUser = await User.findOne({ where: { email: email } });
      if (findGithubUser) {
        res.send(findGithubUser);
      } else {
        const user = await User.create({
          user_name: userName,
          email,
          photo,
          first_name: firstName,
          last_name: lastName,
          phone: phone ? phone : 00000000,
          city: "",
          state: "",
          dni: "",
          professional: false,
          professions: [],
        });

        let newProfessional = await Professional.create({
          certification_name,
          certification_img,
          status: "normal",
        });
        await user.setProfessional(newProfessional);
        res.send(user);
      }
    } catch (error) {
      res.send(error);
    }
  },
  googleLog: async (req, res, next) => {
    const {
      userName,
      firstName,
      lastName,
      email,
      photo,
      certification_name,
      certification_img,
    } = req.body;
    try {
      const findGoogleUser = await User.findOne({ where: { email: email } });
      if (findGoogleUser) {
        res.send(findGoogleUser);
      } else {
        const user = await User.create({
          user_name: userName,
          email,
          photo,
          first_name: firstName,
          last_name: lastName,
          phone: phone ? phone : 00000000,
          city: "",
          state: "",
          dni: "",
          professional: false,
          professions: [],
        });

        let newProfessional = await Professional.create({
          certification_name,
          certification_img,
          status: "normal",
        });
        await user.setProfessional(newProfessional);
        res.send(user);
      }
    } catch (error) {
      res.send(error);
    }
  },
  facebookLog: async (req, res, next) => {
    const {
      userName,
      firstName,
      lastName,
      email,
      photo,
      certification_name,
      certification_img,
    } = req.body;
    try {
      const findFacebookUser = await User.findOne({ where: { email: email } });
      if (findFacebookUser) {
        res.send(findFacebookUser);
      } else {
        const user = await User.create({
          user_name: userName,
          email,
          photo,
          first_name: firstName,
          last_name: lastName,
          phone: phone ? phone : 00000000,
          city: "",
          state: "",
          dni: "",
          professional: false,
          professions: [],
        });

        let newProfessional = await Professional.create({
          certification_name,
          certification_img,
          status: "normal",
        });
        await user.setProfessional(newProfessional);
        res.send(user);
      }
    } catch (error) {
      res.send(error);
    }
  },
};
