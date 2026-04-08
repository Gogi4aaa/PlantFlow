import { PrismaClient } from '@prisma/client';

let prisma = null;

/**
 * Initialize the Prisma client
 */
export async function initDatabase() {
    try {
        prisma = new PrismaClient();
        await prisma.$connect();
        console.log('Connected to MySQL database via Prisma');
        return prisma;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
}

/**
 * Get the Prisma client instance
 */
export function getDatabase() {
    if (!prisma) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return prisma;
}

/**
 * Close the database connection
 */
export async function closeDatabase() {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
        console.log('Database connection closed');
    }
}

export default {
    initDatabase,
    getDatabase,
    closeDatabase
};
