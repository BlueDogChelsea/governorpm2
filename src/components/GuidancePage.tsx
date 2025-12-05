import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownClean } from '../utils/markdownClean';

const sections = {
    "PM² Guide": [
        "Introduction",
        "Project Management",
        "PM² Methodology Overview",
        "Roles & Organisation",
        "Initiating Phase",
        "Planning Phase",
        "Executing Phase",
        "Closing Phase",
        "Monitor & Control",
        "Appendix A",
        "Appendix B",
        "Appendix C",
        "Appendix D",
        "Appendix E",
        "Appendix F",
        "Appendix G"
    ]
};

const topicMap: Record<string, string> = {
    "Introduction": "introduction",
    "Project Management": "project_management",
    "PM² Methodology Overview": "pm2_methodology_overview",
    "Roles & Organisation": "roles_and_organisation",
    "Initiating Phase": "initiating_phase",
    "Planning Phase": "planning_phase",
    "Executing Phase": "executing_phase",
    "Closing Phase": "closing_phase",
    "Monitor & Control": "monitor_and_control",
    "Appendix A": "appendix_a",
    "Appendix B": "appendix_b",
    "Appendix C": "appendix_c",
    "Appendix D": "appendix_d",
    "Appendix E": "appendix_e",
    "Appendix F": "appendix_f",
    "Appendix G": "appendix_g"
};

interface GuidancePageProps {
    initialTopic?: string | null;
    targetSection?: string | null;
    returnPath?: { tab: string; label: string } | null;
    onReturn?: () => void;
    onClearTarget?: () => void;
}

const GuidancePage: React.FC<GuidancePageProps> = ({ initialTopic, targetSection, returnPath, onReturn, onClearTarget }) => {
    const [openSection, setOpenSection] = useState<string | null>("PM² Guide");
    const [selectedTopic, setSelectedTopic] = useState<string | null>("Introduction");
    const [content, setContent] = useState<any | null>(null);
    const lastHighlightedSection = React.useRef<string | null>(null);

    useEffect(() => {
        if (initialTopic) {
            setSelectedTopic(initialTopic);
            // Also open the section that contains this topic
            const section = Object.entries(sections).find(([_, items]) => items.includes(initialTopic));
            if (section) {
                setOpenSection(section[0]);
            }
        }
    }, [initialTopic]);

    const toggleSection = (section: string) => {
        setOpenSection(prev => (prev === section ? null : section));
    };

    useEffect(() => {
        const loadContent = async () => {
            if (!selectedTopic) {
                setContent(null);
                return;
            }

            const filename = topicMap[selectedTopic];
            if (!filename) {
                setContent({ title: selectedTopic, summary: "Guidance not yet available.", sections: [] });
                return;
            }

            try {
                // Use Vite's import.meta.glob for dynamic imports
                const modules = (import.meta as any).glob('../data/pm2/*.json');
                const fullPath = `../data/pm2/${filename}.json`;

                const loader = modules[fullPath];

                if (loader) {
                    const module: any = await loader();
                    setContent(module.default);
                } else {
                    console.warn(`Module not found: ${fullPath}`);
                    setContent({ title: selectedTopic, summary: "Guidance not yet available.", sections: [] });
                }
            } catch (error) {
                console.warn(`Failed to load guidance for ${selectedTopic}:`, error);
                setContent({ title: selectedTopic, summary: "Guidance not yet available.", sections: [] });
            }
        };

        loadContent();
    }, [selectedTopic]);

    // Handle deep linking to specific section
    useEffect(() => {
        if (content && targetSection) {
            // Create a slug from the target section title to match generated IDs
            // Simple slugify: lowercase, replace spaces/dots with dashes
            const slug = targetSection.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Prevent re-highlighting the same thing if react strict mode runs twice or rapid updates occur
            if (lastHighlightedSection.current === slug && !onClearTarget) {
                // Optimization: if we don't have a clear callback, we might want to avoid re-running
                // But with onClearTarget, the prop should become null shortly anyway.
            }

            // Allow time for content to render
            setTimeout(() => {
                const element = document.getElementById(slug);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Add highlight animation class
                    // Remove first to reset animation if it was already there (rare case)
                    element.classList.remove('animate-highlight');
                    void element.offsetWidth; // trigger reflow
                    element.classList.add('animate-highlight');

                    lastHighlightedSection.current = slug;

                    // Clear the target so manual navigation doesn't re-trigger it
                    if (onClearTarget) {
                        // Small delay to ensure the highlight started before we clear the state
                        // creating a clean "one-off" event
                        setTimeout(onClearTarget, 500);
                    }
                }
            }, 300);
        }
    }, [content, targetSection, onClearTarget]);

    const renderContent = () => {
        if (!selectedTopic) {
            return <p className="text-gray-600">Select a topic to view PM² guidance.</p>;
        }

        if (!content) {
            return <p className="text-gray-600">Loading...</p>;
        }

        if ((!content.summary) && (!content.sections || content.sections.length === 0)) {
            return (
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
                    <p className="text-gray-600 italic">
                        Content coming soon...
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
                    {content.summary && <p className="text-lg text-gray-700 leading-relaxed">{content.summary}</p>}
                </div>

                <div className="space-y-8">
                    {content.sections && content.sections.map((section: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <h2
                                id={(section.number ? `${section.number} ${section.title || section.heading}` : section.title || section.heading).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                                className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 scroll-mt-4"
                            >
                                {section.number ? `${section.number} ` : ''}{section.title || section.heading}
                            </h2>

                            {/* Handle Markdown content */}
                            {section.markdown && (
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            h1: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900" {...props} />,
                                            h2: ({ node, ...props }) => <h4 className="text-md font-bold mt-3 mb-2 text-gray-800" {...props} />,
                                            h3: ({ node, ...props }) => <h5 className="text-sm font-bold mt-2 mb-1 text-gray-800" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 text-gray-700 mb-4" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-200 pl-4 text-gray-600 my-4 bg-gray-50 p-2 rounded-r" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                            img: ({ node, ...props }) => <img className="max-w-full h-auto rounded shadow-sm my-4" {...props} />,
                                            table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full border-collapse border border-gray-300" {...props} /></div>,
                                            thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
                                            tbody: ({ node, ...props }) => <tbody className="bg-white" {...props} />,
                                            tr: ({ node, ...props }) => <tr className="border-b border-gray-200 hover:bg-gray-50" {...props} />,
                                            th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700" {...props} />,
                                            td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2 align-top text-gray-700" {...props} />,
                                        }}
                                    >
                                        {markdownClean(section.markdown)}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* Handle new 'content' array structure (fallback) */}
                            {section.content && Array.isArray(section.content) && !section.markdown && section.content.map((paragraph: string, pIndex: number) => (
                                <p key={pIndex} className="text-gray-700 leading-relaxed mb-2">
                                    {paragraph}
                                </p>
                            ))}

                            {/* Handle legacy 'body' string structure */}
                            {section.body && (
                                <p className="text-gray-700 leading-relaxed">{section.body}</p>
                            )}

                            {/* Handle legacy 'list' array structure */}
                            {section.list && (
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {section.list.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Back Navigation Bar */}
            {returnPath && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center sticky top-0 z-10">
                    <button
                        onClick={onReturn}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Back to {returnPath.label}
                    </button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
                    {Object.entries(sections).map(([section, items]) => (
                        <div key={section} className="mb-4">
                            <button
                                onClick={() => toggleSection(section)}
                                className="w-full text-left font-semibold mb-1 hover:text-blue-600 transition-colors px-2"
                            >
                                {section}
                            </button>

                            {openSection === section && (
                                <ul className="ml-4 space-y-1 mt-1">
                                    {items.map((item: string) => (
                                        <li
                                            key={item}
                                            onClick={() => setSelectedTopic(item)}
                                            className={`cursor-pointer px-2 py-1 rounded text-sm transition-colors ${selectedTopic === item
                                                ? "font-semibold text-blue-700 bg-blue-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                                }`}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </aside>

                {/* RIGHT CONTENT AREA */}
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default GuidancePage;
