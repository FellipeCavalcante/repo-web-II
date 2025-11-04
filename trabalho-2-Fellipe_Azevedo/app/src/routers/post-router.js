import { Router } from "express";
import { PostController } from "../controller/post-controller.js";
import formidable from "formidable";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = new Router();
const postController = new PostController();

// Upload de imagem
const handleUpload = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const form = formidable({
    uploadDir: path.join(__dirname, "../../public/uploads"),
    createDirsFromUploads: true,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Erro no upload: " + err.message });
    }

    req.body = {
      title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
      description: Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description,
      link: Array.isArray(fields.link) ? fields.link[0] : fields.link,
    };

    req.file = files.imagem ? files.imagem[0] : null;

    console.log("Campos processados:", req.body);
    console.log("Arquivo:", req.file);

    next();
  });
};

router.post(
  "/publish",
  handleUpload,
  postController.create.bind(postController)
);
router.post("/:id/like", postController.like.bind(postController));
router.get("/api/posts", postController.getPostsAPI.bind(postController));

export default router;
