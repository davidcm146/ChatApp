import { Card } from '@/components/ui/card'
import { Id } from '@/convex/_generated/dataModel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import React from 'react'
import { User } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Badge } from '@/components/ui/badge'

type Props = {
    id : Id<"conversations">,
    imageUrl : string,
    username : string,
    lastMessageContent ?: string,
    lastMessageSender ?: string,
    unseenCount : number
}

const ConversationItem = ({id, imageUrl, unseenCount, username, lastMessageContent, lastMessageSender}: Props) => {
    const currentUser = useQuery(api.user.getCurrentUser);

  return (
    <Link href={`/conversations/${id}`} className="w-full">
        <Card className="p-2 flex flex-row items-center gap-4 truncate">
            <div className="flex flex-row items-center gap-4 truncate">
                <Avatar>
                    <AvatarImage src={imageUrl}/>
                    <AvatarFallback>
                        <User/>
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                    <h4 className="truncate gap-4">{username}</h4>
                    {lastMessageContent && lastMessageSender ? 
                    <span className="text-sm text-muted-foreground flex truncate overflow-ellipsis">
                        <p className="font-semibold">
                            {lastMessageSender === currentUser?.username ? "Me" : lastMessageSender}
                            {":"}&nbsp;
                        </p>
                        <p className="truncate overflow-ellipsis">
                            {lastMessageContent}
                        </p>
                    </span>
                    : <p className="text-sm text-muted-foreground truncate">
                        Start the conversation for now
                    </p>}
                </div>
            </div>
            {
                unseenCount > 0 ? <Badge>
                    {unseenCount}
                </Badge> : null
            }
        </Card>
    </Link>
  )
}

export default ConversationItem