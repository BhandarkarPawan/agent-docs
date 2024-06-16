import { Button } from "@/components/tailwind/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquarePlus } from "lucide-react";
import { EditorBubbleItem, type EditorInstance, useEditor } from "novel";

type CommentSelectorOptions = {
  onAddComment: (content: string) => void;
};

const CommentSelector = ({ onAddComment }: CommentSelectorOptions) => {
  const { editor } = useEditor();

  const addComment = (editor: EditorInstance) => {
    const commentId = Math.random().toString(36).substring(2);
    console.log("Adds comment with id: ", commentId);
    console.log("editor: ", editor.chain().focus());
    editor.chain().focus().setComment(commentId).run();
    onAddComment("");
  };

  return (
    <EditorBubbleItem onSelect={addComment}>
      <Button size="sm" className="rounded-none" variant="ghost">
        <MessageSquarePlus
          className={cn("h-4 w-4", {
            "text-blue-500": editor.isActive("comment"),
          })}
        />
      </Button>
    </EditorBubbleItem>
  );
};

export default CommentSelector;
