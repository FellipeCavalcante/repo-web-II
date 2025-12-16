import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de categorias...");

  const categories = [
    // Linguagens de Programação
    { name: "JavaScript", slug: "javascript" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Python", slug: "python" },
    { name: "Java", slug: "java" },
    { name: "C#", slug: "csharp" },
    { name: "Go", slug: "go" },
    { name: "Rust", slug: "rust" },
    { name: "PHP", slug: "php" },
    { name: "Ruby", slug: "ruby" },
    { name: "Kotlin", slug: "kotlin" },

    // Frameworks & Bibliotecas
    { name: "React", slug: "react" },
    { name: "Angular", slug: "angular" },
    { name: "Vue.js", slug: "vuejs" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Node.js", slug: "nodejs" },
    { name: "Express", slug: "express" },
    { name: "Fastify", slug: "fastify" },
    { name: "NestJS", slug: "nestjs" },
    { name: "Django", slug: "django" },
    { name: "Flask", slug: "flask" },
    { name: "Spring Boot", slug: "spring-boot" },
    { name: "Laravel", slug: "laravel" },

    // Bancos de Dados
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "MySQL", slug: "mysql" },
    { name: "MongoDB", slug: "mongodb" },
    { name: "Redis", slug: "redis" },
    { name: "SQLite", slug: "sqlite" },
    { name: "Prisma", slug: "prisma" },

    // DevOps & Cloud
    { name: "Docker", slug: "docker" },
    { name: "Kubernetes", slug: "kubernetes" },
    { name: "AWS", slug: "aws" },
    { name: "Azure", slug: "azure" },
    { name: "Google Cloud", slug: "google-cloud" },
    { name: "CI/CD", slug: "cicd" },
    { name: "GitHub Actions", slug: "github-actions" },
    { name: "Jenkins", slug: "jenkins" },

    // Arquitetura & Padrões
    { name: "Clean Architecture", slug: "clean-architecture" },
    { name: "Microservices", slug: "microservices" },
    { name: "REST API", slug: "rest-api" },
    { name: "GraphQL", slug: "graphql" },
    { name: "Design Patterns", slug: "design-patterns" },
    { name: "DDD", slug: "ddd" },
    { name: "TDD", slug: "tdd" },
    { name: "SOLID", slug: "solid" },

    // Mobile
    { name: "React Native", slug: "react-native" },
    { name: "Flutter", slug: "flutter" },
    { name: "Swift", slug: "swift" },
    { name: "Android", slug: "android" },
    { name: "iOS", slug: "ios" },

    // IA & Machine Learning
    { name: "Inteligência Artificial", slug: "ia" },
    { name: "Machine Learning", slug: "machine-learning" },
    { name: "Deep Learning", slug: "deep-learning" },
    { name: "ChatGPT", slug: "chatgpt" },
    { name: "LLMs", slug: "llms" },
    { name: "TensorFlow", slug: "tensorflow" },
    { name: "PyTorch", slug: "pytorch" },

    // Segurança
    { name: "Cybersecurity", slug: "cybersecurity" },
    { name: "Ethical Hacking", slug: "ethical-hacking" },
    { name: "Criptografia", slug: "criptografia" },
    { name: "OAuth", slug: "oauth" },
    { name: "JWT", slug: "jwt" },

    // Front-end
    { name: "HTML", slug: "html" },
    { name: "CSS", slug: "css" },
    { name: "Tailwind CSS", slug: "tailwind" },
    { name: "SASS", slug: "sass" },
    { name: "Webpack", slug: "webpack" },
    { name: "Vite", slug: "vite" },

    // Ferramentas & Produtividade
    { name: "Git", slug: "git" },
    { name: "GitHub", slug: "github" },
    { name: "VS Code", slug: "vscode" },
    { name: "Linux", slug: "linux" },
    { name: "Vim", slug: "vim" },
    { name: "Terminal", slug: "terminal" },

    // Soft Skills & Carreira
    { name: "Carreira em TI", slug: "carreira-ti" },
    { name: "Freelancer", slug: "freelancer" },
    { name: "Entrevistas", slug: "entrevistas" },
    { name: "Soft Skills", slug: "soft-skills" },
    { name: "Networking", slug: "networking" },

    // Gaming & Hardware
    { name: "Game Development", slug: "game-dev" },
    { name: "Unity", slug: "unity" },
    { name: "Unreal Engine", slug: "unreal" },
    { name: "Hardware", slug: "hardware" },
    { name: "PC Building", slug: "pc-building" },
    { name: "Raspberry Pi", slug: "raspberry-pi" },

    // Blockchain & Web3
    { name: "Blockchain", slug: "blockchain" },
    { name: "Ethereum", slug: "ethereum" },
    { name: "Smart Contracts", slug: "smart-contracts" },
    { name: "Web3", slug: "web3" },
    { name: "NFT", slug: "nft" },

    // Outros
    { name: "Open Source", slug: "open-source" },
    { name: "Algoritmos", slug: "algoritmos" },
    { name: "Data Science", slug: "data-science" },
    { name: "Big Data", slug: "big-data" },
    { name: "IoT", slug: "iot" },
    { name: "Automação", slug: "automacao" },
    { name: "Web Scraping", slug: "web-scraping" },
    { name: "APIs", slug: "apis" },
  ];

  let created = 0;
  let skipped = 0;

  for (const category of categories) {
    try {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
      created++;
      console.log(`✅ ${category.name}`);
    } catch (error) {
      skipped++;
      console.log(`⏭️  ${category.name} (já existe)`);
    }
  }

  console.log("\n🎉 Seed concluído!");
  console.log(`📊 ${created} categorias criadas`);
  console.log(`⏭️  ${skipped} categorias puladas (já existiam)`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
