const {
  UserController,
  UserRepository,
  UserService,
  UserModel,
} = require("../module/user/module.js");
const passport = require("passport")
const LocalStrategy = require("passport-local")
const bcrypt = require("bcrypt")
const { Sequelize } = require("sequelize");
const { default: DIContainer, object, get, factory } = require("rsdi");
const multer = require("multer");
const session = require("express-session");

function configureDatabase() {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_PATH,
  });

  return sequelize;
}

function configureMulter(){
  const upload = multer({
    dest: process.env.UPLOAD_MULTER_DIR
  })

  return upload
}

function configureSession() {
  const ONE_WEEK_IN_SECONDS = 604800000;

  const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: ONE_WEEK_IN_SECONDS },
  };

  return session(sessionOptions);
}

function configureUserModel(container) {
  return UserModel.setup(container.get("Sequelize"));
}
function addUserModuleDefinitions(container) {
  container.addDefinitions({
    UserController: object(UserController).construct(get("UserService"), get("passport"), get("LocalStrategy"), get("multer")),
    UserService: object(UserService).construct(get("UserRepository")),
    UserRepository: object(UserRepository).construct(get("UserModel"), get("bcrypt")),
    UserModel: factory(configureUserModel),
  });
}

function addCommonDefinitions(container) {
  container.addDefinitions({
    passport,
    LocalStrategy,
    bcrypt,
    multer: factory(configureMulter),
    Sequelize: factory(configureDatabase),
    session: factory(configureSession),
  });
}
function configureContainer() {
  const container = new DIContainer();
  addCommonDefinitions(container);
  addUserModuleDefinitions(container);
  return container;
}

module.exports = { configureContainer };
