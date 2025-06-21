import { $Enums } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: $Enums.UserRole | null;
    }
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: $Enums.UserRole | null;
        } & DefaultSession["user"];
    }

    interface User {
        role: $Enums.UserRole | null;
    }
}
