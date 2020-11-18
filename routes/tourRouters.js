const router = require('express').Router();
const tourControllers = require('../controllers/tourController');
const authController = require('../controllers/authController');

router.route('/tour-stats').get(tourControllers.getTourStats);
router
  .route('/top-5-tour')
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);

router
  .route('/')
  .get(authController.protectRoute, tourControllers.getAllTours)
  .post(tourControllers.createTour);
router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(tourControllers.updateTour)
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

module.exports = router;
