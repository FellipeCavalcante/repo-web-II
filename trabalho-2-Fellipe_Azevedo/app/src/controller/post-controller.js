import { PostService } from "../service/post-service.js";

export class PostController {
  constructor() {
    this.postService = new PostService();
  }

  async create(req, res) {
    try {
      if (!req.file) {
        return res.render("publish", {
          error: "Imagem é obrigatória",
          success: null,
        });
      }

      const { title, description, link } = req.body;
      const imageUrl = `/uploads/${req.file.newFilename}`;

      await this.postService.create(
        title,
        description,
        imageUrl,
        link,
        req.session.user.id
      );

      res.redirect("/");
    } catch (error) {
      res.render("publish", {
        error: error.message,
        success: null,
      });
    }
  }

  async like(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Não autorizado" });
      }

      const result = await this.postService.likePost(
        req.params.id,
        req.session.user.id
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPostsAPI(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy || "recent";

      const posts = await this.postService.getPosts(page, 12, sortBy);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
