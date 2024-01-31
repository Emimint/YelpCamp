require("dotenv").config();
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to Yelp-Camp");
  })
  .catch((err) => {
    console.log("Connection to the Yelp-Camp failed: ", err);
  });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      author: "65b017880a5532f0ffca6b11",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dtfm3y3sq/image/upload/v1706462456/YelpCamp/zg6dgys9vdzchk8r3tcj.jpg",
          filename: "YelpCamp/ahfnenvca4tha00h2ubt",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidid",
      price: Math.floor(Math.random() * 1000) + 1,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
