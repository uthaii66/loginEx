import express from 'express';
import validator from '../utilities/validate.js';
import User from "../models/users.model.js";
import jwt from 'jsonwebtoken';
import constants from '../utilities/constants.js';
import argon2 from 'argon2';
import authenticationGuard from '../middlewares/authenticationFilter.js';


var router = express.Router();


router.post("/login", async (req, res) => {

    const loginValidationRules = {
        "email": "required|email",
        "password": "required|string|min:6",
    }

    validator(req.body, loginValidationRules, {}, async (err, result) => {
        if (!result) {
            return res.status(412).send({ status: 'failure', message: 'Validation Failed', error: err })
        } else {

            try {

                const user = await User.findOne({ email: req.body.email });

                if(user && user.errors) {
                    return res.status(404).send({ status: 'failure', message: 'Failed to login', error: user.errors })
                } else if (user && user.email) {
                    if (await argon2.verify(user.password, req.body.password)) {
                        var userDetails = {
                            fullName: user.fullName,
                            email: user.email,
                            isWizardCompleted: user.isWizardCompleted,
                            userId: user._id
                        }
                        const token = jwt.sign(userDetails, constants.jwtSecret, { expiresIn: constants.expiresIn });
                        userDetails.accessToken = token;

                        return res.status(200).send({ status: 'success', message: 'Logged in Successfully', data: userDetails });
                    } else {
                        return res.status(404).send({ status: 'failure', message: 'Invalid Credentials' })
                    }
                } else {
                    return res.status(404).send({ status: 'failure', message: 'Email not registered' })
                }

            } catch (error) {
                return res.status(404).send({ status: 'failure', message: 'Something went wrong', error: error })
            }
        }
    });
});


router.post('/register', async (req, res) => {

    const registerValidationRules = {
        "email": "required|email",
        "password": "required|string|min:6",
        "fullName": "required|string|max:100",
        "firstName": "required|string|max:50",
        "lastName": "required|string|max:50",
        "dateOfBirth": "required|date"
    };

    validator(req.body, registerValidationRules, {}, async (err, result) => {

        if (!result) {
            return res.status(412).send({ status: 'failure', message: 'Validation Failed', error: err })
        } else {

            try {

                const users = await User.find({ email: req.body.email });

                if(users && users.errors) {
                    return res.status(400).send({ status: 'failure', message: 'Failed to get email', error: users.errors })
                } else if (users && users.length) {
                    return res.status(400).send({ status: 'failure', message: 'Email already exists' })
                } else {
                    req.body.password = await argon2.hash(req.body.password);
                    req.body.isWizardCompleted = false;
                    const newUser = new User(req.body);
                    newUser.save();
                    return res.status(200).send({ status: 'success', message: 'Registered Successfully', data: { email: req.body.email } })
                }

            } catch (error) {
                return res.status(404).send({ status: 'failure', message: 'Something went wrong', error: error })
            }
        }
    });
})


router.post('/onBoarding', authenticationGuard, (req, res) => {

    const onBoardingValidationRules = {
        "gstIN": "required|string",
        "storeName": "required|string|max:250",
        "storeAddress": "required|string|max:250",
        "accountHolderName": "required|string|max:100",
        "accountNumber": "required|string|max:100",
        "bankName": "required|string|max:250",
        "ifsc": "required|string|max:11|min:11"
    };

    validator(req.body, onBoardingValidationRules, {}, async (err, result) => {
        if (!result) {
            return res.status(412).send({ status: 'failure', message: 'Validation Failed', error: err });
        } else {
            const filter = { email: req.loggedUser };
            const update = { personalDetails: req.body, isWizardCompleted: true }
            try {

               const updateResult = await User.findOneAndUpdate(filter, update);

               if(updateResult && updateResult.errors) {
                return res.status(412).send({ status: 'failure', message: 'Updating seller details failed', error: updateResult.errors });
               } else {
                return res.status(200).send({ status: 'success', message: 'Seller details updated Successfully', data: { email: req.loggedUser } })
               }
            } catch (error) {
                return res.status(404).send({ status: 'failure', message: 'Something went wrong', error: error })
            }
        }
    });
});


router.get("/onBoardingStatus", authenticationGuard, async (req, res) => {

    try {
        const wizardStatus = await User.findOne({ email: req.loggedUser }).select({ isWizardCompleted: 1, _id: 0 });

        if (wizardStatus.isWizardCompleted) {
            res.status(200).send({ status: 'success', message: 'Seller Completed the On Boarding Wizard', data: { isWizardCompleted: wizardStatus.isWizardCompleted } })
        } else {
            res.status(200).send({ status: 'success', message: 'Seller Completed the On Boarding Wizard', data: { isWizardCompleted: wizardStatus.isWizardCompleted } })
        }

        return

    } catch (error) {
        return res.status(200).send({ status: 'failure', message: 'Getting On boarding status failed', error: error });
    }
});


export default router;