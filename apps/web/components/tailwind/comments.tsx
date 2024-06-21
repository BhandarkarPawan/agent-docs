import useOnClickOutside from "@/hooks/use-on-click-outside";
import { useCompletion } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
};

type CommentDisplayProps = {
  comment: Comment;
  onChange: (content: string) => void;
};

const CommentDisplay = ({ comment, onChange }: CommentDisplayProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(comment.content);
  const [editing, setEditing] = useState(false);

  const { completion, complete, isLoading } = useCompletion({
    // id: "novel",
    api: "/api/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  useEffect(() => {
    onChange(inputValue);
  }, [inputValue]);

  const startEditing = () => setEditing(true);
  const stopEditing = () => setEditing(false);
  useOnClickOutside(ref, stopEditing);

  const hasCompletion = completion.length > 0;

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <div className="p-4 h-auto relative border-muted bg-background sm:rounded-lg sm:border sm:shadow-sm">
      {editing ? (
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        <p onClick={startEditing} onKeyDown={stopEditing}>
          {inputValue}
        </p>
      )}
      <p>Created at: {comment.createdAt}</p>
    </div>
  );
};

type CommentsOptions = {
  comments: Comment[];
  updateComments: (id: string, content: string) => void;
};

const Comments = ({ comments, updateComments }: CommentsOptions) => {
  return (
    <div className="space-y-4 sticky top-0 py-2 ">
      {comments.map((comment) => (
        <CommentDisplay
          onChange={(content) => updateComments(comment.id, content)}
          key={comment.id}
          comment={comment}
        />
      ))}
    </div>
  );
};

export default Comments;
