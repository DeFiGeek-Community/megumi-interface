import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      address: `0x${string}`;
      safeAddress?: `0x${string}`;
    };
  }
  interface User {
    id: string | number;
    resources?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    safeAddress?: `0x${string}`;
  }
}
