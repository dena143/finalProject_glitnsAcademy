const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const router = require("./routes/index");

const errorHandler = require("./middlewares/errorHandler");

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(express.static("public"));

app.use("/", router);

app.all("*", (req, res, next) => {
  next({ statusCode: 404, message: "Endpoint not found" });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`Server running on ${port}`));
}

module.exports = app;
