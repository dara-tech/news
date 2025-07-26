"use client";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Blockquote from "@tiptap/extension-blockquote";
import { useEffect, useRef } from "react";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatQuote,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdCode,
  MdLink,
  MdLinkOff,
  MdUndo,
  MdRedo,
  MdClear,
  MdTitle,
  MdLooksTwo,
} from "react-icons/md";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
};

function ToolbarButton({
  onClick,
  active,
  label,
  icon,
  disabled,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={tooltip || label}
      disabled={disabled}
      className={`px-2 py-1 rounded transition-colors duration-100 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
        active ? "bg-blue-200 text-blue-800" : "text-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      tabIndex={0}
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

const TOOLBAR_ACTIONS = [
  {
    label: "Bold",
    icon: <MdFormatBold size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor: Editor) => editor.isActive("bold"),
    tooltip: "Bold (Ctrl+B)",
  },
  {
    label: "Italic",
    icon: <MdFormatItalic size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor: Editor) => editor.isActive("italic"),
    tooltip: "Italic (Ctrl+I)",
  },
  {
    label: "Underline",
    icon: <MdFormatUnderlined size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor: Editor) => editor.isActive("underline"),
    tooltip: "Underline (Ctrl+U)",
  },
  {
    label: "H1",
    icon: <MdTitle size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
    tooltip: "Heading 1",
  },
  {
    label: "H2",
    icon: <MdLooksTwo size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
    tooltip: "Heading 2",
  },
  {
    label: "Bullet List",
    icon: <MdFormatListBulleted size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive("bulletList"),
    tooltip: "Bullet List",
  },
  {
    label: "Ordered List",
    icon: <MdFormatListNumbered size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive("orderedList"),
    tooltip: "Ordered List",
  },
  {
    label: "Blockquote",
    icon: <MdFormatQuote size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: Editor) => editor.isActive("blockquote"),
    tooltip: "Blockquote",
  },
  {
    label: "Code",
    icon: <MdCode size={20} />,
    action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor: Editor) => editor.isActive("codeBlock"),
    tooltip: "Code Block",
  },
];

export default function TiptapEditor({
  value,
  onChange,
  error,
  label,
  placeholder,
}: Props) {
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
        class:
          "min-h-[180px] p-2 focus:outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
    autofocus: false,
    immediatelyRender: false,
  });

  // Prevent unnecessary setContent calls
  const lastValue = useRef<string>(value);
  useEffect(() => {
    if (editor && value !== lastValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
      lastValue.current = value;
    }
  }, [value, editor]);

  if (!editor) return null;

  // Keyboard shortcut for link
  const handleLink = () => {
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prevUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 p-1 rounded-t">
        {TOOLBAR_ACTIONS.map((btn) => (
          <ToolbarButton
            key={btn.label}
            onClick={() => btn.action(editor)}
            active={btn.isActive(editor)}
            label={btn.label}
            icon={btn.icon}
            tooltip={btn.tooltip}
          />
        ))}
        <ToolbarButton
          onClick={handleLink}
          active={editor.isActive("link")}
          label="Link"
          icon={<MdLink size={20} />}
          tooltip="Insert Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          label="Unlink"
          icon={<MdLinkOff size={20} />}
          tooltip="Remove Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
          icon={<MdUndo size={20} />}
          tooltip="Undo"
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
          icon={<MdRedo size={20} />}
          tooltip="Redo"
          disabled={!editor.can().redo()}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          label="Clear"
          icon={<MdClear size={20} />}
          tooltip="Clear Formatting"
        />
      </div>
      <div
        className={
          error
            ? "border border-red-500 rounded-b"
            : "border rounded-b"
        }
      >
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}