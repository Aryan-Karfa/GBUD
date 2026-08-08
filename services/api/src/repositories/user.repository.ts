import { prisma } from '../config/prisma';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  public async findByEmail(email: string, tx: Prisma.TransactionClient = prisma): Promise<User | null> {
    return tx.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  public async findByUsername(username: string, tx: Prisma.TransactionClient = prisma): Promise<User | null> {
    return tx.user.findUnique({
      where: { username: username.trim() },
    });
  }

  public async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<User | null> {
    return tx.user.findUnique({
      where: { id },
    });
  }

  public async create(
    data: { email: string; username: string; passwordHash: string },
    tx: Prisma.TransactionClient = prisma
  ): Promise<User> {
    return tx.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        username: data.username.trim(),
        passwordHash: data.passwordHash,
      },
    });
  }
}

export const userRepository = new UserRepository();
