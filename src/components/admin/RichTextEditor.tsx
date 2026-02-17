import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Code, Quote,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuButton = ({ onClick, isActive, children, title }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title?: string }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    title={title}
    className={`h-8 w-8 p-0 ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
  >
    {children}
  </Button>
);

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ inline: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL kiriting:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Rasm URL kiriting:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet list">
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code">
          <Code className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={addLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Image">
          <ImageIcon className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export { RichTextEditor };
