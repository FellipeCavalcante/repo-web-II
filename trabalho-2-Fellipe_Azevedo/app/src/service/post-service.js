import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PostService {
  async create(title, description, imageUrl, link, userId) {
    try {
      return await prisma.post.create({
        data: {
          title,
          description,
          imageUrl,
          link,
          userId,
        },
      });
    } catch (error) {
      throw new Error("Erro ao criar post: " + error.message);
    }
  }

  async getPosts(page = 1, limit = 12, sortBy = "recent") {
    const skip = (page - 1) * limit;

    let orderBy = {};
    if (sortBy === "popular") {
      orderBy = {
        likes: {
          _count: "desc",
        },
      };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Formatar resposta
    return posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    }));
  }

  async likePost(postId, userId) {
    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: parseInt(postId),
          },
        },
      });

      if (existingLike) {
        // Remove like
        await prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId: parseInt(postId),
            },
          },
        });
        return { liked: false };
      } else {
        // Add like
        await prisma.like.create({
          data: {
            userId,
            postId: parseInt(postId),
          },
        });
        return { liked: true };
      }
    } catch (error) {
      throw new Error("Erro ao processar like: " + error.message);
    }
  }
}
