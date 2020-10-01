const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'heelo wld', app: 'social_media' });
// });

// app.post('/api/v1', (req, res) => {
//   res.send('You can post now');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (tour) {
    return res.status(200).json({
      status: 'success',
      data: {
        tour: 'Updated tour',
      },
    });
  }
  res.status(404).json({
    status: 'failed',
    message: 'Tour not found',
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (tour) {
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
  res.status(404).json({
    status: 'failed',
    message: 'Tour not found',
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (tour) {
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
  res.status(404).json({
    status: 'Fail',
    message: 'Invalid id',
  });
});
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
