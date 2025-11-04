import { UserService } from "../service/user-service.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async create(req, res) {
    try {
      const { name, email, password, password2 } = req.body;

      await this.userService.create(name, email, password, password2);

      req.session.success = "Conta criada com sucesso! Faça login.";
      res.redirect("/login");
    } catch (error) {
      res.render("signup", {
        error: error.message,
        success: null,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.login(email, password);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      res.redirect("/");
    } catch (error) {
      res.render("login", {
        error: error.message,
        success: null,
      });
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  }
}
