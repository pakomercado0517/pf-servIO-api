require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const {
  DB_PSQL_USER,
  DB_PSQL_PASSWORD,
  DB_PSQL_HOST,
  DB_PSQL_NOMBRE,
  DB_PSQL_TYPE,
  DB_PSQL_PORT,
  DATABASE_URL,
  CLEARDB_DATABASE_URL,
} = process.env;

// console.log('DB_HOST', DB_HOST);

const sequelize = new Sequelize(
  // `${DB_PSQL_TYPE}://${DB_PSQL_USER}:${DB_PSQL_PASSWORD}@${DB_PSQL_HOST}:${DB_PSQL_PORT}/${DB_PSQL_NOMBRE}`,
  `${DATABASE_URL}`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }
);

// const sequelize = new Sequelize(
//   `${DB_TYPE}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/servio`,
//   `${DB_TYPE}://b46beb6a97b8eb:f0e8539a@us-cdbr-east-05.cleardb.net/heroku_3afd94c4ff9413a?reconnect=true`,

//   // `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/servio`,
//   // DATABASE_URL,
//   {
//     logging: false, // set to console.log to see the raw SQL queries
//     native: false, // lets Sequelize know we can use pg-native for ~30% more speed
//   }
// );

const basename = path.basename(__filename);
const modelDefiners = [];
// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
// @ts-ignore
sequelize.models = Object.fromEntries(capsEntries);

const {
  User,
  Profession,
  Professional,
  ClientNeed,
  ClientReview,
  ProfessionalOffer,
  SpecificTechnicalActivity,
  Transactions,
} = sequelize.models;
//*************************************RELACIONES USUARIO****************************************************************

//Relacion User - client_need
User.hasMany(ClientNeed);
ClientNeed.belongsTo(User);

//Relacion User - Transactions
User.hasMany(Transactions);
Transactions.belongsTo(User);

//Relacion User - Profesional
User.hasOne(Professional);
Professional.belongsTo(User);

User.hasMany(ClientReview);
ClientReview.belongsTo(User);

User.hasMany(ProfessionalOffer);
ProfessionalOffer.belongsTo(User);

//*************************************RELACIONES Profesional****************************************************************

//Relacion Profesional - profesion
Professional.belongsToMany(Profession, { through: "Profession_Professional" });
Profession.belongsToMany(Professional, { through: "Profession_Professional" });

//Relacion Profesional - transacci??n
Professional.hasMany(Transactions);
Transactions.belongsTo(Professional);

//Relacion Profesional - SpecificTechnicalActivity
Professional.hasMany(SpecificTechnicalActivity);
SpecificTechnicalActivity.belongsTo(Professional);

//Relacion Profesional - ProfessionalOffer
Professional.hasMany(ProfessionalOffer);
ProfessionalOffer.belongsTo(Professional);

//Relacion Profesional - ClientReview
Professional.hasMany(ClientReview);
ClientReview.belongsTo(Professional);

//*************************************RELACIONES Client_Need****************************************************************

//Relacion client_need - transactions
ClientNeed.hasOne(Transactions);
Transactions.belongsTo(ClientNeed);

//Relacion client_need - professional_offer
ClientNeed.hasMany(ProfessionalOffer);
ProfessionalOffer.belongsTo(ClientNeed);

//Relacion client_need - Profesion
ClientNeed.hasOne(Profession);
Profession.belongsTo(ClientNeed);

//*************************************RELACIONES Professional_Offer****************************************************************

//Relation ProfessionalOffer - Transaction
ProfessionalOffer.hasOne(Transactions);
Transactions.belongsTo(ProfessionalOffer);

//Relacion ProfessionalOffer - ClientReview
ProfessionalOffer.hasOne(ClientReview);
ClientReview.belongsTo(ProfessionalOffer);

//*************************************RELACIONES Specific_Technical_Activity****************************************************************

SpecificTechnicalActivity.hasMany(ClientNeed);
ClientNeed.belongsTo(SpecificTechnicalActivity);

module.exports = {
  ...sequelize.models, // para poder importar los modelos as??: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexi??n { conn } = require('./db.js');
};
