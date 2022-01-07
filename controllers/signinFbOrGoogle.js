const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const jwt = require("jsonwebtoken");
const passport = require("passport");

const { user } = require("../models");
const { encodePin } = require("../utils/bcrypt");

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

exports.signinFb = (req, res, next) => {
  passport.authenticate("signinFb", { session: false }, (err, user, info) => {
    if (err) {
      return next({ message: err.message, statusCode: 401 });
    }

    if (!user) {
      return next({ message: info.message, statusCode: 401 });
    }

    req.user = user;

    const token = jwt.sign(
      {
        data: req.user,
      },
      process.env.SECRET_KEY_JWT
    );

    return res.status(200).json({
      status: 200,
      message: "Success",
      token,
    });
  })(req, res);
};

passport.use(
  "signinFb",
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB_AUTH,
      clientSecret: process.env.CLIENT_SECRET_FB_AUTH,
      callbackURL: "https://api-talikasih.herokuapp.com/signinFb",
      profileFields: [
        "id",
        "displayName",
        "name",
        "gender",
        "picture.type(large)",
        "email",
      ],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const image = profile._json.picture.data.url;
        const { email, name, id } = profile._json;

        let data = await user.findOne({
          where: { email },
        });
        let pass = "Abcd123456@";
        pass = encodePin(pass);
        if (data == null) {
          await user.create({
            name,
            facebookId: id,
            email,
            image,
            password: pass, //bisa di hapus kalau passwordnya null
          });

          data = await user.findOne({ where: { email: profile.email } });
        }

        profile = data;
        return done(null, profile, { message: "Success Login!" });
      } catch (error) {
        return done(error, false, { message: "User can't be created" });
      }
    }
  )
);

exports.signinGoogle = (req, res, next) => {
  passport.authenticate(
    "signinGoogle",
    { scope: ["profile", "email"] },
    (err, user, info) => {
      if (err) {
        return next({ message: err.message, statusCode: 401 });
      }

      if (!user) {
        return next({ message: info.message, statusCode: 401 });
      }

      req.user = user;

      const token = jwt.sign(
        {
          data: req.user,
        },
        process.env.SECRET_KEY_JWT
      );

      return res.status(200).json({
        status: 200,
        message: "Success",
        token,
      });
    }
  )(req, res, next);
};

passport.use(
  "signinGoogle",
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID_MOBILE,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://api-talikasih.herokuapp.com/signinGoogle",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const image = profile.photos.value;
        const { email, name, sub } = profile._json;

        let data = await user.findOne({
          where: { email },
        });
        let pass = "Abcd123456@";
        pass = encodePin(pass);
        if (data == null) {
          await user.create({
            name,
            googleId: sub,
            email,
            image,
            password: pass, //nanti ini bisa dihapus
          });

          data = await user.findOne({ where: { email } });
        }

        profile = data;

        return done(null, profile, { message: "Login success!" });
      } catch (error) {
        return done(error, false, { message: "User can't be created" });
      }
    }
  )
);
