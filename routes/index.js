const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController')
const AuthController = require('../controllers/AuthController')

const router = express.Router({ mergeParams: true });

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postUsers);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

module.exports = router;
