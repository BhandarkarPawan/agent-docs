import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment (add)
       */
      setComment: (attributes: { commentId: string }) => ReturnType;
      /**
       * Toggle a comment
       */
      toggleComment: (attributes: { commentId: string }) => ReturnType;
      /**
       * Unset a comment (remove)
       */
      unsetComment: () => ReturnType;
    };
  }
}

const CommentExtension = Mark.create({
  name: "comment",

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setComment:
        (attributes) =>
        ({ chain }) => {
          console.log("adding comment with attributes", attributes);
          return chain().setMark(this.name, attributes).run();
        },
      toggleComment:
        (attributes) =>
        ({ chain }) => {
          return chain().toggleMark(this.name, attributes).run();
        },
      unsetComment:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

export default CommentExtension;
