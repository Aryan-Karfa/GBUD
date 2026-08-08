import { User, Prisma } from '@prisma/client';
export declare class UserRepository {
    findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null>;
    findByUsername(username: string, tx?: Prisma.TransactionClient): Promise<User | null>;
    findById(id: string, tx?: Prisma.TransactionClient): Promise<User | null>;
    create(data: {
        email: string;
        username: string;
        passwordHash: string;
    }, tx?: Prisma.TransactionClient): Promise<User>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map