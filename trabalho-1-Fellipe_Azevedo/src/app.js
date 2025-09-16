import express from "express";
import { usersRouter } from "./routes/users-routes.js";
import { logger } from "./middlewares/logger.js";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.redirect("/users/lista");
});

app.use((req, res) => {
  res.status(404).send("NOT FOUND");
});

app.listen(3000, () => {
  console.log("ESCUTANDO NA PORTA 3000");
});
