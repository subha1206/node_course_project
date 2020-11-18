const router = require('express').Router();

const userControllers = require('../controllers/userController');
const authController = require('../controllers/authController');

// // app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// // app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protectRoute,
  authController.updatePassword
);
router.patch(
  '/update-me',
  authController.protectRoute,
  userControllers.updateMe
);
router.delete(
  '/delete-me',
  authController.protectRoute,
  userControllers.deleteMe
);

router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

module.exports = router;
