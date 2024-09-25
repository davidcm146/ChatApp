import { Card } from '@/components/ui/card'
import { Id } from '@/convex/_generated/dataModel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import React from 'react'
import { User } from 'lucide-react'

type Props = {
    id : Id<"conversations">,
    imageUrl : string,
    username : string
}

const ConversationItem = ({id, imageUrl, username}: Props) => {
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
                    <p className="text-sm text-muted-foreground truncate">
                        Start the conversation for now
                    </p>
                </div>
            </div>
        </Card>
    </Link>
  )
}

export default ConversationItem