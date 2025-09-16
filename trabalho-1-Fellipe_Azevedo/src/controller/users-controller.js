import { select, insert, deleted } from "../config/db.js";

export function mostraFormularioCadastro(req, res) {
  res.render("users-form", { novoUsuario: {} });
}

export function criarUsuario(req, res) {
  const { name, username, role, status, email } = req.body;

  let novoUsuario = {
    name,
    username,
    role,
    status,
    email,
    createdAt: new Date().toISOString().split("T")[0],
  };

  insert(novoUsuario);

  res.redirect("/users/lista");
}

export function deleteUsuario(req, res) {
  const { id } = req.params;
  const usuario = select().find((u) => u.id === parseInt(id));

  if (!usuario) {
    return res.status(404).send("Usuário não encontrado");
  }

  if (usuario.role === "ADMIN") {
    return res.status(403).send("Não é permitido deletar usuários ADMIN");
  }

  deleted(id);
  res.redirect("/users/lista");
}

export function listarUsuarios(req, res) {
  let { search, role, status, sort, page } = req.query;
  let dados = select();

  if (search) {
    const s = search.toLowerCase();
    dados = dados.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
    );
  }

  if (role) {
    dados = dados.filter((u) => u.role === role);
  }

  if (status) {
    dados = dados.filter((u) => u.status === status);
  }

  if (sort === "newest") {
    dados = dados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === "oldest") {
    dados = dados.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === "az") {
    dados = dados.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "za") {
    dados = dados.sort((a, b) => b.name.localeCompare(a.name));
  }

  const pageSize = 10;
  page = parseInt(page) || 1;
  const totalUsers = dados.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const dadosPagina = dados.slice(startIndex, endIndex);

  res.render("users-lista", {
    dados: dadosPagina,
    search,
    role,
    status,
    sort,
    page,
    totalPages,
    totalUsers,
  });
}

export function mostraFormularioEdicao(req, res) {
  const { id } = req.params;
  const usuario = select().find((u) => u.id === parseInt(id));

  if (!usuario) {
    return res.status(404).send("Usuário não encontrado");
  }

  res.render("users-form", { novoUsuario: usuario });
}

export function editarUsuario(req, res) {
  const { id } = req.params;
  const { name, username, role, status, email } = req.body;

  const usuario = select().find((u) => u.id === parseInt(id));
  if (!usuario) {
    return res.status(404).send("Usuário não encontrado");
  }

  usuario.name = name;
  usuario.username = username;
  usuario.role = role;
  usuario.status = status;
  usuario.email = email;

  res.redirect("/users/lista");
}

export function exportarUsuariosCSV(req, res) {
  const dados = select().filter((u) => u.status !== "DELETED");

  const header = [
    "ID",
    "Name",
    "Username",
    "Role",
    "Status",
    "Email",
    "CreatedAt",
  ];
  const rows = dados.map((u) => [
    u.id,
    u.name,
    u.username,
    u.role,
    u.status,
    u.email,
    u.createdAt,
  ]);

  const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=usuarios.csv");
  res.send(csvContent);
}
