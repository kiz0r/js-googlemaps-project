const mongoose = require('mongoose');

const carSchema = mongoose.Schema(
  {
    mark: {
      type: String,
      required: [true, 'Please, enter a mark of a car.'],
    },
    model: {
      type: String,
      required: [true, 'Please, enter a model of a car.'],
    },
    consumption: {
      type: Number,
      required: [true, 'Please, enter a car consumption.'],
    },
    avgSpeed: {
      type: Number,
      required: [true, 'Please, enter a car speed.'],
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
