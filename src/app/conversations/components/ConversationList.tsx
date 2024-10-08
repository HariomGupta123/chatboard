"use client"
import useConversation from '@/app/hooks/useConversation'
import { FullConversationType } from '@/app/types'
import clsx from 'clsx'
import React, { useEffect, useMemo, useState } from 'react'
import { MdOutlineGroupAdd } from 'react-icons/md'
import ConversationBox from './ConversationBox'
import { useRouter } from 'next/navigation'
import GroupChatModel from './GroupChatModel'
import { User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/app/libs/pusher'
import { find } from 'lodash'
interface conversationsListProps {
  intialItems: FullConversationType[]
  users:User[]

}

const ConversationList: React.FC<conversationsListProps> = ({ intialItems,users }) => {
  const [items, setItems] = useState(intialItems);
  const session=useSession();
  const { isOpen,conversationId } = useConversation()
  const [isModelOpen,setIsModelOpen]=useState(false);
  const router=useRouter();
  const pusherKey=useMemo(()=>{
    console.log(session.data?.user?.email)
    return session.data?.user?.email
  }, [session.data?.user?.email]);
  useEffect(()=>{
    if(!pusherKey){
      return
    }
    pusherClient.subscribe(pusherKey);
    const newHandler=(conversation:FullConversationType)=>{
      setItems((current)=>{
        if(find(current,{id:conversationId})){
          return current
        }
        return [conversation,...current]
      })

    };
    const updateHandler=(conversation:FullConversationType)=>{
      setItems((current)=>current.map((currentConversation)=>{
          if(currentConversation.id ===conversation.id){
            return {
              ...currentConversation,messages:conversation.messages
            }
          }
          return currentConversation
        })
        
      )
    };
    const removeHandler=(conversation:FullConversationType)=>{
      setItems((current)=>{
        return [...current.filter((convo)=>convo.id !==conversation.id)]
      });
      if(conversationId ===conversation.id){
        router.push('/conversations');
      }
    };
    pusherClient.bind('conversation:remove',removeHandler)
    pusherClient.bind('conversation:new',newHandler);
    pusherClient.bind('conversation:update',updateHandler)
    return ()=>{
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind('conversation:new',newHandler);
      pusherClient.unbind('conversation:update', updateHandler);
      pusherClient.unbind('conversation:remove', removeHandler)


    }
  },[pusherKey,conversationId,router]);

  return (
    <>
    <GroupChatModel 
    isOpen={isModelOpen}
     onClose={()=>setIsModelOpen(false)}
     users={users}
     />
    <aside className={clsx(`fixed inset-y-0 pb-20 lg:pb-0 border-r-[1px]
      lg:left-20
      lg:w-80
      lg:block
      overflow-y-auto
      border-gray-200
      `, isOpen ? "hidden" : "block w-full left-0")}>
      <div className='px-5'>
        <div className='flex justify-between mb-4 pt-4'>
          <div className='text-2xl
          
          font-bold
          text-neutral-800'>
            message
          </div>
          <div  className='rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition'>
            <MdOutlineGroupAdd size={20} onClick={()=>setIsModelOpen(true)}/>

          </div>

        </div>
        {items.map((item)=>(
          <ConversationBox 
          data={item}
          selected={conversationId === item.id}
          key={item.id}
          />
        ))}
      

      </div>
    </aside>
    </>
  )
}
export default ConversationList
