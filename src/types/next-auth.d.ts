// Define UserRole enum manually since it's not being exported from generated client
enum UserRole {
    NORMAL_USER = "NORMAL_USER",
    PARENT_GUARDIAN = "PARENT_GUARDIAN",
    THERAPIST = "THERAPIST",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN"
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: UserRole;
        };
    }

    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: UserRole;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole;
    }
}
