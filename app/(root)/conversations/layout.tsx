import ItemList from '@/components/shared/item-list/ItemList'
import React from 'react'

type Props = React.PropsWithChildren<{}>

const ConversationsLayoutLayout = ({children} : Props) => {
  return (
    <>
      <ItemList title="Conversations">
        Conversation page
      </ItemList>
      {children}
    </>
  )
}

export default ConversationsLayoutLayout
