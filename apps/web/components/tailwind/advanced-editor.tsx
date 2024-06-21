"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuidv4 } from "uuid";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import { handleImageDrop, handleImagePaste } from "novel/plugins";
import Comments from "./comments";
import type { Comment } from "./comments";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import CommentSelector from "./selectors/comment-selector";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null,
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      setCharsCount(editor.storage.characterCount.words());
      window.localStorage.setItem(
        "html-content",
        highlightCodeblocks(editor.getHTML()),
      );
      window.localStorage.setItem("novel-content", JSON.stringify(json));
      window.localStorage.setItem(
        "markdown",
        editor.storage.markdown.getMarkdown(),
      );
      setSaveStatus("Saved");
    },
    500,
  );

  useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);

    const comments = window.localStorage.getItem("comments");
    if (comments) setComments(JSON.parse(comments));
    else setComments([]);
  }, []);

  if (!initialContent) return null;

  const addComment = () => {
    setComments([
      ...comments,
      {
        id: uuidv4(),
        content: "This is a comment",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateComments = (id: string, content: string) => {
    const newComments = comments.map((comment) => {
      if (comment.id === id) {
        return {
          ...comment,
          content: content,
        };
      }
      return comment;
    });
    setComments(newComments);
    window.localStorage.setItem("comments", JSON.stringify(newComments));
  };

  return (
    <div className="relative flex space-x-4 items-start">
      <div className="relative w-full max-w-screen-lg">
        <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
          <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
            {saveStatus}
          </div>
          <div
            className={
              charsCount
                ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground"
                : "hidden"
            }
          >
            {charsCount} Words
          </div>
        </div>
        <EditorRoot>
          <EditorContent
            initialContent={initialContent}
            extensions={extensions}
            className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
            editorProps={{
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              handlePaste: (view, event) =>
                handleImagePaste(view, event, uploadFn),
              handleDrop: (view, event, _slice, moved) =>
                handleImageDrop(view, event, moved, uploadFn),
              attributes: {
                class:
                  "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
              },
            }}
            onUpdate={({ editor }) => {
              debouncedUpdates(editor);
              setSaveStatus("Unsaved");
            }}
            slotAfter={<ImageResizer />}
          >
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-muted-foreground">
                No results
              </EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item) => (
                  <EditorCommandItem
                    value={item.title}
                    onCommand={(val) => item.command(val)}
                    className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                    key={item.title}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </EditorCommandItem>
                ))}
              </EditorCommandList>
            </EditorCommand>

            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
              <Separator orientation="vertical" />
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />

              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <TextButtons />
              <CommentSelector onAddComment={addComment} />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          </EditorContent>
        </EditorRoot>
      </div>
      <Comments comments={comments} updateComments={updateComments} />
    </div>
  );
};

export default TailwindAdvancedEditor;
