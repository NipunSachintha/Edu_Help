import React from "react";

const ChatBox = ({conversation}) => {
    

    return (
        <div>
        <div className="h-[60vh] bg-secondary rounded-4xl flex flex-col relative p-4 overflow-auto">
            
                {conversation.map((item,index)=>(
                    <div className={`flex ${item.role === 'user'&&'justify-end'}`}>
                        {item.role === 'assistant'?
                        <h2 className="p-1 px-2 bg-primary mt-1 text-white inline-block rounded-md">{item?.content}</h2>:
                        <h2 className="p-1 px-2 bg-gray-200 mt-1 inline-block rounded-md">{item?.content}</h2>
                        }
                        
                    </div>
                ))}
            
          </div>
          <h2 className="mt-4 text-gray-400 text-smaller">
            At the end of the conversation, we will automatically generate
            feedback/notes
          </h2>
          </div>
    );
};

export default ChatBox;
