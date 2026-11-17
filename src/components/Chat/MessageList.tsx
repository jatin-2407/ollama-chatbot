
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { IMessage } from "../PromptBox";


type MessageListProps = {
  messages: IMessage[];
  requestType?: string;
};

const UserMessage = ({ message }: { message: string }) => (
  <div className="flex justify-end mb-4">
    <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap">
      {message}
    </div>
  </div>
);

const ChatBotMessage = ({ message }: { message: string }) => (
  <div className="flex justify-start mb-4 w-full">
    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl max-w-[95%] w-fit overflow-hidden">
      <div className="prose prose-sm max-w-none break-words
        prose-pre:bg-gray-900 prose-pre:text-white
        prose-code:text-pink-600
        prose-a:text-blue-600
        prose-table:border-collapse
        prose-th:border prose-th:p-2
        prose-td:border prose-td:p-2">

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message}
        </ReactMarkdown>

      </div>
    </div>
  </div>
);

const MessageList: React.FC<MessageListProps> = ({
  messages,
  requestType,
}) => {
  return (
    <div className="flex flex-col w-full">
      {messages.map((msg, index) => {
        if (msg.role === "user") {
          return <UserMessage key={index} message={msg.content} />;
        }

        if (msg.role === "assistant") {
          return <ChatBotMessage key={index} message={msg.content} />;
        }

        return null;
      })}
    </div>
  );
};

export default MessageList;
