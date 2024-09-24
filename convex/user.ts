import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            // First, check if the user already exists to prevent duplicates
            const existingUser = await ctx.db.query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
                .unique();
            
            if (existingUser) {
                console.log(`User with clerkId ${args.clerkId} already exists.`);
                return; // Do not insert a duplicate user
            }

            // Insert new user if they don't exist
            await ctx.db.insert("users", args);
            console.log(`Created user with clerkId ${args.clerkId}`);
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    },
});

export const get = internalQuery({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
        try {
            const user = await ctx.db.query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
                .unique();

            return user || null; // Return null if no user is found
        } catch (error) {
            console.error("Error retrieving user:", error);
            throw new Error("Failed to retrieve user");
        }
    }
});
