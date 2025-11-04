import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const insereUsuario = async ({ name, email, password, cpf }) => {
  const usuario = await prisma.usuario.create({
    data: {
      name,
      email,
      password,
      cpf,
    },
  });
  console.log(usuario);
};

const buscaUsuarios = async () => {
  const usuarios = await prisma.usuario.findMany();
  console.log(usuarios);
};

const insereProduto = async (produto) => {
  const prod = await prisma.produto.create({
    data: produto,
  });
  console.log(prod);
};

const detalharUsuarioComPedidos = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      Pedido: {
        include: {
          produtos: true,
        },
      },
    },
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log(JSON.stringify(usuario, null, 2));
};

const criarPedido = async (idUsuario, idProdutos) => {
  const pedido = await prisma.pedido.create({
    data: {
      usuarioId: idUsuario,
      produtos: {
        connect: idProdutos.map((id) => ({ id })),
      },
      total: 0, // carregar produtos para somar os preços,
      status: "PAGAMENTO_PENDENTE",
    },
    // RELACAO - trazer os produtos relacionados
    include: {
      produtos: true,
    },
  });
  console.log(pedido);
};

const main = async () => {
  // await insereUsuario({
  //     name: "ronaldo",
  //     email: "ronaldo@gmail.com",
  //     password: "123456",
  //     cpf: "12345678901"
  // })

  // await insereUsuario({
  //     name: "david",
  //     email: "david@gmail.com",
  //     password: "123456",
  //     cpf: "12345678902"
  // })

  // await buscaUsuarios();

  // await insereProduto({
  //     nome: "Teclado",
  //     descricao: "Teclado mecanico",
  //     preco: 300
  // });

  // await insereProduto({
  //     nome: "Monitor 4K",
  //     descricao: "Samsung 4k 28' - bom de trabalhar",
  //     preco: 1500
  // });

  // await insereProduto({
  //     nome: "Mouse",
  //     descricao: "RedDragon",
  //     preco: 150
  // });

  // await criarPedido(1, [1, 2]);
  // await criarPedido(2, [2, 3]);
  // await criarPedido(3, [3]);

  // await criarPedido(1, [3]);
  await detalharUsuarioComPedidos(1);
};

main();
