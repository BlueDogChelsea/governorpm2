import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import {
    BoldIcon,
    ItalicIcon,
    ListBulletIcon,
    NumberedListIcon,
    H3Icon
} from '@heroicons/react/24/outline'

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        className={`p-1.5 rounded-md transition-colors ${disabled ? 'opacity-50 cursor-not-allowed text-gray-400' :
                isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        title={title}
    >
        {children}
    </button>
)

const RichTextEditor = ({ value, onChange, placeholder, disabled, className = "" }) => {
    // Local state to reliably track focus and manage toolbar visibility
    const [isFocused, setIsFocused] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: placeholder || '',
                emptyEditorClass: 'is-editor-empty',
            })
        ],
        content: value || '',
        editable: !disabled,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange(html)
        },
        // We use these handlers to toggle visibility of the toolbar
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            attributes: {
                class: `prose-custom min-h-[120px] p-3 focus:outline-none ${disabled ? 'text-gray-500' : 'text-gray-900'}`
            }
        }
    })

    // Update editable state when disabled prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled)
        }
    }, [disabled, editor])

    return (
        <div className={`w-full rounded-lg border-[1.5px] border-slate-300 bg-white shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 ${disabled ? 'bg-slate-50' : 'bg-white'} ${className}`}>
            {/* Toolbar: Visible ONLY when editor is focused (or purely active) */}
            {editor && !disabled && (
                <div className={`flex flex-wrap gap-1 px-2 py-2 border-b border-slate-200 bg-gray-50 transition-all duration-200 overflow-hidden ${isFocused
                        ? 'opacity-100 max-h-20'
                        : 'opacity-0 max-h-0 border-0 py-0'
                    }`}>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <BoldIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <ItalicIcon className="w-4 h-4" />
                    </MenuButton>
                    {/* Headings */}
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3 (H3)"
                    >
                        <H3Icon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        isActive={editor.isActive('heading', { level: 4 })}
                        title="Heading 4 (H4)"
                    >
                        <span className="text-xs font-bold leading-none px-0.5">H4</span>
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <ListBulletIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <NumberedListIcon className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

                    {/* Indent / Outdent */}
                    <MenuButton
                        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                        disabled={!editor.can().sinkListItem('listItem')}
                        title="Indent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                        </svg>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                        disabled={!editor.can().liftListItem('listItem')}
                        title="Outdent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                        </svg>
                    </MenuButton>
                </div>
            )}
            <EditorContent editor={editor} />
            <style>{`
                .prose-custom p { margin-bottom: 0.5em; }
                .prose-custom ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
                .prose-custom ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
                .prose-custom h3 { font-size: 1.25em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; color: #1f2937; }
                .prose-custom h4 { font-size: 1.1em; font-weight: 600; margin-top: 0.75em; margin-bottom: 0.5em; color: #374151; }
                .prose-custom strong { font-weight: 700; color: #111827; }
                .prose-custom em { font-style: italic; }
                
                /* Placeholder styling */
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #9ca3af;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
            `}</style>
        </div>
    )
}

export default RichTextEditor
