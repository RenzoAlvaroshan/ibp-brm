import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from 'tiptap-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  CheckSquare, Code, Minus,
} from 'lucide-react'
import { cn } from '@/utils'

// ─── Read-only markdown renderer (react-markdown) ─────────────────────────────

export function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-[18px] font-bold text-gray-900 mt-3 mb-1.5 leading-snug">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[15px] font-bold text-gray-900 mt-3 mb-1 leading-snug">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[13px] font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
        p:  ({ children }) => <p  className="text-[13px] text-gray-700 leading-relaxed mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
        em:     ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside text-[13px] text-gray-700 mb-2 space-y-0.5 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside text-[13px] text-gray-700 mb-2 space-y-0.5 pl-1">{children}</ol>,
        li: ({ children }) => <li className="text-[13px] text-gray-700">{children}</li>,
        code: ({ className: cls, children, ...rest }) =>
          cls?.startsWith('language-') ? (
            <code className="block bg-gray-900 text-gray-100 text-[12px] font-mono rounded-lg px-4 py-3 my-2 overflow-x-auto whitespace-pre" {...rest}>{children}</code>
          ) : (
            <code className="bg-gray-100 text-violet-700 text-[12px] font-mono rounded px-1.5 py-0.5" {...rest}>{children}</code>
          ),
        pre:        ({ children }) => <>{children}</>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-violet-300 pl-3 my-2 text-[13px] text-gray-500 italic">{children}</blockquote>,
        a:   ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">{children}</a>,
        img: ({ src, alt })       => <img src={src} alt={alt} className="max-w-full rounded-lg border border-gray-200 my-2" />,
        hr:  ()                   => <hr className="border-gray-200 my-3" />,
        table: ({ children }) => <div className="overflow-x-auto my-2"><table className="text-[12px] border-collapse w-full">{children}</table></div>,
        th: ({ children }) => <th className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-left font-semibold text-gray-700">{children}</th>,
        td: ({ children }) => <td className="border border-gray-200 px-3 py-1.5 text-gray-700">{children}</td>,
        input: ({ type, checked }) =>
          type === 'checkbox' ? <input type="checkbox" checked={checked} readOnly className="mr-1.5 accent-violet-600" /> : null,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolBtn({
  icon: Icon, title, active, onClick,
}: { icon: React.ElementType; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-violet-100 text-violet-700'
          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
      )}
    >
      <Icon size={13} />
    </button>
  )
}

// ─── WYSIWYG editor ───────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange?: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export default function MarkdownEditor({ value, onChange, onBlur, placeholder, className, autoFocus }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { languageClassPrefix: 'language-' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write something…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({ html: false, tightLists: true }),
    ],
    content: value,
    autofocus: autoFocus ? 'end' : false,
    onBlur: () => {
      onBlur?.()
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Escape') {
          view.dom.blur()
          return true
        }
        if (event.key === 'Tab') {
          event.preventDefault()
          const editorDom = view.dom
          const focusables = Array.from(
            document.querySelectorAll<HTMLElement>(
              'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null && !editorDom.contains(el))

          let target: HTMLElement | undefined
          if (event.shiftKey) {
            const before = focusables.filter(
              (el) => (editorDom.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
            )
            target = before[before.length - 1]
          } else {
            target = focusables.find(
              (el) => (editorDom.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
            )
          }

          if (target) target.focus()
          else view.dom.blur()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.storage.markdown.getMarkdown())
    },
  })

  if (!editor) return null

  const cmd = editor.chain().focus()

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all bg-white', className)}>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolBtn icon={Bold}        title="Bold (Ctrl+B)"    active={editor.isActive('bold')}          onClick={() => cmd.toggleBold().run()} />
        <ToolBtn icon={Italic}      title="Italic (Ctrl+I)"  active={editor.isActive('italic')}        onClick={() => cmd.toggleItalic().run()} />
        <ToolBtn icon={Heading2}    title="Heading 2"        active={editor.isActive('heading', { level: 2 })} onClick={() => cmd.toggleHeading({ level: 2 }).run()} />
        <ToolBtn icon={Heading3}    title="Heading 3"        active={editor.isActive('heading', { level: 3 })} onClick={() => cmd.toggleHeading({ level: 3 }).run()} />
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <ToolBtn icon={List}        title="Bullet list"      active={editor.isActive('bulletList')}    onClick={() => cmd.toggleBulletList().run()} />
        <ToolBtn icon={ListOrdered} title="Numbered list"    active={editor.isActive('orderedList')}   onClick={() => cmd.toggleOrderedList().run()} />
        <ToolBtn icon={CheckSquare} title="Task list"        active={editor.isActive('taskList')}      onClick={() => cmd.toggleTaskList().run()} />
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <ToolBtn icon={Code}        title="Inline code"      active={editor.isActive('code')}          onClick={() => cmd.toggleCode().run()} />
        <ToolBtn icon={Minus}       title="Divider"                                                    onClick={() => cmd.setHorizontalRule().run()} />
      </div>

      {/* Editor canvas */}
      <EditorContent
        editor={editor}
        className="px-4 py-3 min-h-[120px] cursor-text"
      />
    </div>
  )
}
