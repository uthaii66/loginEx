import jwt from 'jsonwebtoken';
import constants from '../utilities/constants.js';

const authenticationGuard = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        jwt.verify(authHeader, constants.jwtSecret, (err, result) => {

            if (err) {
                res.status(401).send({ status: 'failure', message: 'Invalid token', data: {}, error: "Token is expired/invalid" });
            } else {
                req["loggedUser"] = result.email;
                next();
            }

        })
    } else {
        res.status(401).send({ status: 'failure', message: 'Invalid Request', data: {}, error: "Token was not provided" })
    }
}

export default authenticationGuard;