import { getDatabase } from '../database/db.js';
import bcrypt from 'bcryptjs';

class User {
    /**
     * Create a new user with hashed password
     */
    static async create(userData) {
        const prisma = getDatabase();
        const { email, password, full_name, role } = userData;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: full_name,
                role: role || 'USER'
            }
        });

        return this._sanitize(user);
    }

    /**
     * Find user by email (returns wrapper with password for internal auth checks)
     * Note: This returns the RAW prisma object including password. 
     * Be careful not to return this directly to API response without sanitizing.
     */
    static async findByEmailWithPassword(email) {
        const prisma = getDatabase();
        return prisma.user.findUnique({
            where: { email }
        });
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const prisma = getDatabase();
        const user = await prisma.user.findUnique({
            where: { id }
        });
        return this._sanitize(user);
    }

    /**
     * Compare password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        const prisma = getDatabase();
        const { email, password, full_name, role, profile_picture } = userData;

        const dataToUpdate = {};
        if (email) dataToUpdate.email = email;
        if (full_name) dataToUpdate.fullName = full_name;
        if (role) dataToUpdate.role = role;
        if (profile_picture !== undefined) dataToUpdate.profilePicture = profile_picture;

        // Hash password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(password, salt);
        }

        const user = await prisma.user.update({
            where: { id },
            data: dataToUpdate
        });

        return this._sanitize(user);
    }

    /**
     * Remove sensitive fields
     */
    static _sanitize(user) {
        if (!user) return null;
        const { password, ...safeUser } = user;
        // Map Prisma camelCase back to snake_case for API consistency
        return {
            ...safeUser,
            full_name: safeUser.fullName,
            profile_picture: safeUser.profilePicture,
        };
    }

    /**
     * List users with pagination and filters (Admin only)
     */
    static async list({ page = 1, limit = 10, search = '', role = null } = {}) {
        const prisma = getDatabase();
        const skip = (page - 1) * limit;

        const where = {};

        // Search filter
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { fullName: { contains: search } }
            ];
        }

        // Role filter
        if (role) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { devices: true }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users: users.map(user => this._sanitize(user)),
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Delete user and all associated data (Admin only)
     */
    static async delete(id) {
        const prisma = getDatabase();

        // Prisma will cascade delete related devices, sensor readings, and alerts
        await prisma.user.delete({
            where: { id }
        });

        return true;
    }

    /**
     * Count total users
     */
    static async count() {
        const prisma = getDatabase();
        return prisma.user.count();
    }

    /**
     * Get users created in the last N days
     */
    static async getRecentUsers(days = 7) {
        const prisma = getDatabase();
        const since = new Date();
        since.setDate(since.getDate() - days);

        return prisma.user.count({
            where: {
                createdAt: { gte: since }
            }
        });
    }
}

export default User;
