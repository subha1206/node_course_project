const router = require('express').Router();

const userControllers = require('../controllers/userController');

// // app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// // app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

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
