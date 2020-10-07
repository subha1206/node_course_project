const router = require('express').Router();
const tourControllers = require('../controllers/tourController');

router.param('id', (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  next();
});

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(tourControllers.createTour);
router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(tourControllers.updateTour)
  .delete(tourControllers.deleteTour);

module.exports = router;
