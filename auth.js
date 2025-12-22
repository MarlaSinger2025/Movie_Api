const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy 

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign({ _id: user._id }, jwtSecret, { // Only getting the User-ID as payload, not all user informations
        subject: user.Username, // This is the username you're encoding in thr JWT
        expiresIn: '7d', // Specifies that the token expires in 7 days
        algorithm: 'HS256' // Algorithm used to "sign" or encode the values of the JWT
    });
}

/* POST login. */
module.exports = (router) => {
    router.post('/login', (req,res) => {
        passport.authenticate('local', { session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false}, (error) => {
                if (error) {
                    res.send(erorr);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token});
            });
        })(req, res);
    });
}