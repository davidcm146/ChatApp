"use client"
import ItemList from '@/components/shared/item-list/ItemList'
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { api } from '@/convex/_generated/api';
import ConversationItem from './_components/ConversationItem';
import CreateGroupDialog from './_components/CreateGroupDialog';
import GroupConversationItem from './_components/GroupConversationItem';

type Props = React.PropsWithChildren

const ConversationsLayout = ({children} : Props) => {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title="Conversations" action={<CreateGroupDialog/>}>
        {conversations ? 
          (conversations.length === 0 ? 
            (
              <p className="w-full h-full flex items-center justify-center">No conversations found</p>
            ) : conversations.map((conversation) => {
              return conversation.conversation.isGroup ? 
              <GroupConversationItem key={conversation.conversation._id} id={conversation.conversation._id} lastMessageContent={conversation.lastMessage?.content} lastMessageSender={conversation.lastMessage?.sender}  name={conversation.conversation.name || ""} unseenCount={conversation.unseenCount} /> 
              : <ConversationItem key={conversation.conversation._id} unseenCount={conversation.unseenCount} id={conversation.conversation._id} lastMessageContent={conversation.lastMessage?.content} lastMessageSender={conversation.lastMessage?.sender}  username={conversation.otherMember?.username || ""} imageUrl={conversation.otherMember?.imageUrl || ""}/>
            })
          ) : <Loader2/>
        }
      </ItemList>
      {children}
    </>
  )
}

export default ConversationsLayout
