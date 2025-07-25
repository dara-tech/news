"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Blockquote from "@tiptap/extension-blockquote";
import { useEffect } from "react";

// Toolbar button helper
function ToolbarButton({ onClick, active, label, icon, disabled }: { onClick: () => void; active?: boolean; label: string; icon?: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`px-2 py-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 ${active ? "bg-blue-200 text-blue-800" : "text-gray-700"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon || label}
    </button>
  );
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label: string;
  placeholder?: string;
};

export default function TiptapEditor({ value, onChange, error, label, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Blockquote,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[180px] p-2 focus:outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
    autofocus: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 p-1 rounded-t">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="Bold" icon={<b>B</b>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="Italic" icon={<i>I</i>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} label="Underline" icon={<u>U</u>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} label="H1" icon={<span className="font-bold">H1</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="H2" icon={<span className="font-bold">H2</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="Bullet List" icon={<span>• List</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="Ordered List" icon={<span>1. List</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} label="Blockquote" icon={<span>❝</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} label="Code" icon={<span>&lt;/&gt;</span>} />
        <ToolbarButton onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} active={editor.isActive('link')} label="Link" icon={<span>🔗</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} label="Unlink" icon={<span>❌</span>} />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo" icon={<span>↺</span>} disabled={!editor.can().undo()} />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo" icon={<span>↻</span>} disabled={!editor.can().redo()} />
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} label="Clear" icon={<span>🧹</span>} />
      </div>
      <div className={error ? "border border-red-500 rounded-b" : "border rounded-b"}>
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}