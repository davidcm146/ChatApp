import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) throw new ConvexError("Unauthorized");
        if (args.email === identity.email)
            throw new ConvexError("Cannot send request to yourself");

        const currentUser = await getUserByClerkId({
            ctx,
            clerkId: identity.subject,
        });

        if (!currentUser) throw new ConvexError("User not found");

        const receiver = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!receiver) throw new ConvexError("User could not be found");

        // Combine both friend queries in one by checking either user1 or user2
        const friendCheck1 = await ctx.db
      .query("friends")
      .withIndex("by_user1_user2", (q) => q.eq("user1", currentUser._id).eq("user2", receiver._id))
      .unique();

    const friendCheck2 = await ctx.db
      .query("friends")
      .withIndex("by_user1_user2", (q) => q.eq("user1", receiver._id).eq("user2", currentUser._id))
      .unique();

        // If either of the queries returned a result, the users are already friends
        if (friendCheck1 || friendCheck2) {
            throw new ConvexError("You are already friends with this user");
        }

        const requestAlreadySent = await ctx.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", receiver._id).eq("sender", currentUser._id)
            )
            .unique();

        if (requestAlreadySent) {
            throw new ConvexError("Request already sent");
        }

        const requestAlreadyReceived = await ctx.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", currentUser._id).eq("sender", receiver._id)
            )
            .unique();

        if (requestAlreadyReceived) {
            throw new ConvexError("This user already sent you a request");
        }

        const request = await ctx.db.insert("requests", {
            sender: currentUser._id,
            receiver: receiver._id,
        });

        return request;
    },
});


export const deny = mutation({
    args: {
        id: v.id("requests"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
            throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject })

        if (!currentUser)
            throw new ConvexError("User not found");

        const request = await ctx.db.get(args.id);

        if (!request || request.receiver !== currentUser._id) {
            throw new ConvexError("There was an error denying this request")
        }

        await ctx.db.delete(args.id);
    }
})

export const accept = mutation({
    args: {
        id: v.id("requests")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
            throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject })

        if (!currentUser)
            throw new ConvexError("User not found");

        const request = await ctx.db.get(args.id);

        if (!request || request.receiver !== currentUser._id) {
            throw new ConvexError("There was an error accepting this request")
        }

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false
        })

        await ctx.db.insert("friends", {
            user1: currentUser._id,
            user2: request.sender,
            conversationId
        })

        await ctx.db.insert("conversationMembers", {
            memberId: currentUser._id,
            conversationId
        })

        await ctx.db.insert("conversationMembers", {
            memberId: request.sender,
            conversationId
        })

        await ctx.db.delete(request._id);
    }
})