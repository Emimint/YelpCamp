if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const User = require("./models/user");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const userRoutes = require("./routes/users");
const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";
// process.env.DB_URL;

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

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

const sessionConfig = {
  store,
  name: "yelpcamp_session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com",
  "https://unpkg.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com",
  "https://unpkg.com/",
];
const connectSrcUrls = ["https://res.cloudinary.com", "https://unpkg.com/"];

const fontSrcUrls = ["https://res.cloudinary.com"];

app.use(session(sessionConfig));
app.use(flash());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dtfm3y3sq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://unpkg.com/",
        "https://*.tile.openstreetmap.org/",
        "https://*.tile.osm.org/",
        "http://*.tile.osm.org/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dtfm3y3sq/"],
      childSrc: ["blob:"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

// Main route:
app.get("/", (req, res) => {
  res.render("home", { what: "best", who: "me" });
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((error, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = error;
  // if(!error.status) error.status = 500;
  res.status(status).render("error", { error });
});

app.listen(3000, () => {
  console.log("Serving on port 3000.");
});
