const Router = require('express');
const router = new Router();
const controller = require('./authController');
const { check } = require('express-validator');
const authMiddleware = require('./middleware/authMiddleware');

router.post('/signup', [
    check('id', "Field cant be empty").notEmpty(),
    check('password', "Password must be more than 4 and less than 10 characters").isLength({min: 4, max: 10}),
] ,controller.registration);
router.post('/signin', controller.login);
router.get('/info', authMiddleware, controller.info);
router.get('/latency', controller.latency);
router.get('/logout', authMiddleware, controller.logout);

module.exports = router;