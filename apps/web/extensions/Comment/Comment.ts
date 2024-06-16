import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment (add)
       */
      setComment: (commentId: string) => ReturnType;
      /**
       * Unset a comment (remove)
       */
      unsetComment: (commentId: string) => ReturnType;
      /**
       * Set comment as active
       */
      setActiveComment: (commentId: string) => ReturnType;
    };
  }
}

const CommentExtension = Mark.create({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addCommands() {
    return {
      setComment:
        (commentId) =>
        ({ commands }) => {
          if (!commentId) return false;
          console.log("set comment", commentId);
          commands.setMark(this.name, { commentId });
        },
      unsetComment:
        (commentId) =>
        ({ commands }) => {
          if (!commentId) return false;
          console.log("unset comment", commentId);
        },
    };
  },
});

export default CommentExtension;
