import { Button } from "@/components/tailwind/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquarePlus } from "lucide-react";
import { EditorBubbleItem, type EditorInstance, useEditor } from "novel";
import { v4 as uuidv4 } from "uuid";

type CommentSelectorOptions = {
  onAddComment: (id: string) => void;
  onRemoveComment: (id: string) => void;
};

const CommentSelector = ({
  onAddComment,
  onRemoveComment,
}: CommentSelectorOptions) => {
  const { editor } = useEditor();

  const toggleComment = (editor: EditorInstance) => {
    if (editor.isActive("comment")) {
      const commentId = editor.getAttributes("comment").commentId;
      editor.chain().focus().unsetComment().run();
      onRemoveComment(commentId);
    } else {
      const commentId = uuidv4();
      editor.chain().focus().setComment({ commentId }).run();
      onAddComment(commentId);
    }
  };

  return (
    <EditorBubbleItem onSelect={toggleComment}>
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
