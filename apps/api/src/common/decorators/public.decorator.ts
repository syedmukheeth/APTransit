import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Marks a route as reachable without login. The global auth guard (Day 3) reads this. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
