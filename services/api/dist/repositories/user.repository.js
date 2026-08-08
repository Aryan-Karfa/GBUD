"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const prisma_1 = require("../config/prisma");
class UserRepository {
    async findByEmail(email, tx = prisma_1.prisma) {
        return tx.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
    }
    async findByUsername(username, tx = prisma_1.prisma) {
        return tx.user.findUnique({
            where: { username: username.trim() },
        });
    }
    async findById(id, tx = prisma_1.prisma) {
        return tx.user.findUnique({
            where: { id },
        });
    }
    async create(data, tx = prisma_1.prisma) {
        return tx.user.create({
            data: {
                email: data.email.toLowerCase().trim(),
                username: data.username.trim(),
                passwordHash: data.passwordHash,
            },
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map