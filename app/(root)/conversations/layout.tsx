"use client"
import ItemList from '@/components/shared/item-list/ItemList'
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React from 'react'
import ConversationItem from './_components/ConversationItem';

type Props = React.PropsWithChildren<{}>

const ConversationsLayoutLayout = ({children} : Props) => {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title="Conversations">
        {conversations ? 
          (conversations.length === 0 ? 
            (
              <p className="w-full h-full flex items-center justify-between">No conversations found</p>
            ) : conversations.map((conversation) => {
              return conversation.conversation.isGroup ? null 
              : <ConversationItem key={conversation.conversation._id} id={conversation.conversation._id} username={conversation.otherMember?.username || ""} imageUrl={conversation.otherMember?.imageUrl || ""}/>
            })
          ) : <Loader2/>
        }
      </ItemList>
      {children}
    </>
  )
}

export default ConversationsLayoutLayout
