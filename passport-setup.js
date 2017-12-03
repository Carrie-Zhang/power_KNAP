const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.serializeUser((user, done) => {
  // give the browser the users google profile id to store in cookie
  done(null, user.id);
});

// passport.deserializeUser((id, done) => {
//   // browser sends back id, we identify the user with it
//     // need to store users in db to use this
// });

// passport.use(new GoogleStrategy({
//   callbackURL: '/auth/google/redirect',
//   clientID: process.env.GOOGLECLIENTID,
//   clientSecret: process.env.GOOGLECLIENTSECRET,
// }, (accessToken, refreshToken, profile, done) => {
//   done(null, profile);
// }));
