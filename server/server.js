const express = require('express');
const mongoose = require('mongoose');
const Car = require('./models/carModel');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // => for update date not only by json method
app.use(
  cors({
    origin: '*',
  })
);

// start page
app.get('/', (req, res) => {
  res.send('start page');
});

// fetch cars
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// fetch car by id
app.get('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use(bodyParser.json());

// find and update car info
app.put('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByIdAndUpdate(id, req.body);
    if (!car) {
      // we cannot find any car in database
      return res
        .status(404)
        .json({ message: `Cannot find any car with ID ${id}` });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/cars', async (req, res) => {
  try {
    const car = await Car.create(req.body); // создаем новый объект модели Car на основе полученных данных
    await car.save(); // сохраняем объект в базу данных
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.post('/cars', async (req, res) => {
//   try {
//     const car = await Car.create(req.body);

//     res.status(200).json(car);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
//   console.log(req.body);
//   res.send(req.body);
// });

// connection to MongoDB
mongoose.set('strictQuery', false);
mongoose
  .connect(
    'mongodb+srv://kirill:1234@google-app.rxpcl7g.mongodb.net/Cars?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Listening port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
