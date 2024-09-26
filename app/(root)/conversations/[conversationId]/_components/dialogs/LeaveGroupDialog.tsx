"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useMutationState } from '@/hooks/useMutationState'
import { ConvexError } from 'convex/values'
import React, { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'

type Props = {
    conversationId : Id<"conversations">,
    open : boolean,
    setOpen : Dispatch<SetStateAction<boolean>>
}

const LeaveGroupDialog = ({conversationId, open, setOpen}: Props) => {
    const {mutate : leaveGroup, pending } = useMutationState(api.conversation.leaveGroup);

    const handleLeaveGroup = async() => {
        leaveGroup({conversationId})
        .then(() => {
            toast.success("Group left")
        })
        .catch((error) => {
            toast.error(error instanceof ConvexError ? error.data : "Unexpected error occurred")
        })
    }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-white text-black">
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you sure ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undo. You will not be able to see previous messages or send any messages in this group.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction disabled={pending} onClick={handleLeaveGroup}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default LeaveGroupDialog