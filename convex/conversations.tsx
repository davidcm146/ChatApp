import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";


export const get = query({
    args : {},
    handler : async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity){
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId : identity.subject
        })

        if (!currentUser){
            throw new ConvexError("User not found");
        }

        const conversationMemberships = await ctx.db.query("conversationMembers").withIndex("by_memberId", (q)=>q.eq("memberId", currentUser._id)).collect();

        const conversations = Promise.all(conversationMemberships?.map(async (membership) => {
            const conversation = await ctx.db.get(membership.conversationId);

            if (!conversation){
                throw new ConvexError("Conversation could not be found");
            }

            return conversation;
        }))

        const conversationsWithDetails = await Promise.all(
            (await conversations).map(async (conversation) => {
              const conversationMemberships = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .collect();
          
              // Find the membership for the current user
              const currentMembership = conversationMemberships.find(
                (membership) => membership.memberId === currentUser._id
              );
          
              const lastMessage = await getLastMessageDetails({ ctx, id: conversation.lastMessageId });
          
              const lastSeenMessage = currentMembership?.lastSeenMessage
                ? await ctx.db.get(currentMembership.lastSeenMessage)
                : null;
          
              const lastSeenMessageTime = lastSeenMessage ? lastSeenMessage._creationTime : 0;
          
              // Update unseenMessages logic
              let unseenMessages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .filter((q) => q.gt(q.field("_creationTime"), lastSeenMessageTime))
                .collect();
          
              // Exclude messages sent by the current user unless the user is the only participant
              unseenMessages = unseenMessages.filter(
                (message) => message.senderId !== currentUser._id || conversation.isGroup
              );
          
              if (conversation.isGroup) {
                return {
                  conversation,
                  lastMessage,
                  unseenCount: unseenMessages.length,
                };
              } else {
                const otherMembership = conversationMemberships.find(
                  (membership) => membership.memberId !== currentUser._id
                )!;
                const otherMember = await ctx.db.get(otherMembership.memberId);
                return {
                  conversation,
                  otherMember,
                  lastMessage,
                  unseenCount: unseenMessages.length,
                };
              }
            })
          );
          

        return conversationsWithDetails
    }
})

const getLastMessageDetails = async({ctx, id}: {ctx : QueryCtx | MutationCtx; id : Id<"messages"> | undefined}) => {
    if (!id){
        return null;
    }

    const message = await ctx.db.get(id);
    if(!message) return null;

    const sender = await ctx.db.get(message.senderId);

    if (!sender) return null;

    const content = getMessageContent(message.type, message.content as unknown as string);

    return {
        content, 
        sender : sender.username
    }
}

const getMessageContent = (type : string, content : string) => {
    switch (type) {
        case "text":
            return content;
            break;
    
        default:
            return "[Non-text]";
            break;
    }
}