import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routers/user-router.js";
import postRouter from "./routers/post-router.js";
import { logMiddleware } from "./middleware/log-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(logMiddleware);

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.get("/", async (req, res) => {
  try {
    const { PostService } = await import("./service/post-service.js");
    const postService = new PostService();

    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || "recent";

    const posts = await postService.getPosts(page, 12, sortBy);
    const isLoggedIn = !!req.session.user;

    res.render("main", {
      posts,
      currentPage: page,
      sortBy: sortBy,
      isLoggedIn,
      user: req.session.user,
      error: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("main", {
      posts: [],
      currentPage: 1,
      sortBy: "recent",
      error: "Erro ao carregar posts",
      isLoggedIn: !!req.session.user,
      user: req.session.user,
    });
  }
});

app.get("/signup", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup", { error: null, success: null });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login", { error: null, success: null });
});

app.get("/publish", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("publish", { error: null, success: null });
});

app.use((req, res) => {
  res.status(404).render("404", {
    isLoggedIn: !!req.session.user,
    user: req.session.user,
  });
});

app.listen(PORT, () => {
  console.log("ESCUTANDO NA PORTA 3000");
});
