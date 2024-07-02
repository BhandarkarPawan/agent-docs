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

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
    };
  },

  renderHTML({ HTMLAttributes }) {
    console.log("foo: ", this.options.HTMLAttributes, "bar: ", HTMLAttributes);
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

  onSelectionUpdate() {
    const { $from } = this.editor.view.state.selection;
    const commentMark = $from.marks().find((mark) => mark.type === this.type);
    if (!commentMark) return;
    this.options.onCommentActivated(commentMark.attrs.commentId);
  },

  addCommands() {
    return {
      setComment:
        (attributes) =>
        ({ chain }) => {
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
