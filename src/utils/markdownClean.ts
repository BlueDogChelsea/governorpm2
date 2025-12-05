export function markdownClean(input: string): string {
    let text = input;
    const placeholders: string[] = [];

    const generatePlaceholder = (content: string) => {
        placeholders.push(content);
        return `%%%PH${placeholders.length - 1}%%%`;
    };

    // Helper to convert ASCII tables to Markdown tables
    const convertAsciiTables = (txt: string) => {
        // Regex to capture a full ASCII table block
        const tableBlockRegex = /(?:^(?:\||\+).*$)(?:\r?\n(?:\||\+).*$)*/gm;

        return txt.replace(tableBlockRegex, (tableBlock) => {
            const lines = tableBlock.split(/\r?\n/);
            const processedRows: { cells: string[], isHeader: boolean }[] = [];
            let rowBuffer: string[][] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('+')) {
                    // Separator line
                    if (rowBuffer.length > 0) {
                        // Flush buffer to a new row
                        const mergedCells = [];
                        const colCount = rowBuffer[0].length;

                        for (let c = 0; c < colCount; c++) {
                            // Process lines for this cell
                            const rawLines = rowBuffer.map(l => l[c] || '');

                            // Filter out empty padding lines, but keep content
                            // We need to process them in order to handle wrapping vs new items
                            const contentLines = rawLines
                                .map(l => l.trim())
                                .filter(l => l !== '');

                            if (contentLines.length === 0) {
                                mergedCells.push('');
                                continue;
                            }

                            let cellContent = '';

                            for (let j = 0; j < contentLines.length; j++) {
                                // Clean artifacts:
                                // 1. Remove leading '> ' (quote markers)
                                // 2. Remove '**' and '__' (bold markers)
                                let cleanLine = contentLines[j]
                                    .replace(/^>\s*/, '')
                                    .replace(/(\*\*|__)/g, '');

                                // Determine if this line starts a new item (bullet or number)
                                // Matches: "- ", "* ", "• ", "1. "
                                const isNewItem = /^([-*•]|\d+\.)\s/.test(cleanLine);

                                if (j === 0) {
                                    cellContent = cleanLine;
                                } else {
                                    // If it's a new item, use <br>
                                    // If it's just text (continuation), use space
                                    if (isNewItem) {
                                        cellContent += '<br>' + cleanLine;
                                    } else {
                                        cellContent += ' ' + cleanLine;
                                    }
                                }
                            }
                            mergedCells.push(cellContent);
                        }

                        const isHeader = line.includes('=');
                        processedRows.push({ cells: mergedCells, isHeader });
                        rowBuffer = [];
                    }
                } else if (line.startsWith('|')) {
                    // Content line
                    const cells = line.split('|').slice(1, -1);
                    rowBuffer.push(cells);
                }
            }

            if (processedRows.length === 0) return tableBlock;

            let md = '';
            const headerRow = processedRows[0];

            // Build Header
            md += '| ' + headerRow.cells.join(' | ') + ' |\n';

            // Build Separator
            md += '| ' + headerRow.cells.map(() => '---').join(' | ') + ' |\n';

            // Build Data Rows
            for (let i = 1; i < processedRows.length; i++) {
                md += '| ' + processedRows[i].cells.join(' | ') + ' |\n';
            }

            return md;
        });
    };

    // 1. Convert ASCII Tables to Markdown Tables
    text = convertAsciiTables(text);

    // 2. Remove {underline} and {.underline} artifacts globally
    text = text.replace(/\{[\.]?underline\}/g, '');

    // 3. Fix bare links [url] -> [url](url)
    text = text.replace(/\[(https?:\/\/[^\]]+)\](?!\()/g, (match, url) => {
        let cleanUrl = url.trim();
        cleanUrl = cleanUrl.replace(/[.,;:\s_]+$/, '');
        return `[${cleanUrl}](${cleanUrl})`;
    });

    // 4. Clean existing links where the text is a URL but dirty
    text = text.replace(/\[(https?:\/\/[^\]]+)\]\(([^)]+)\)/g, (match, textUrl, actualUrl) => {
        let cleanText = textUrl.trim().replace(/[.,;:\s_]+$/, '');
        return `[${cleanText}](${actualUrl})`;
    });

    // 5. Auto-link bare URLs in text
    text = text.replace(/(?<![\[\(])(https?:\/\/[^\s\)<]+)(?![\]\)])/g, '[$1]($1)');

    // 6. Protect Link URLs from underscore/asterisk escaping
    text = text.replace(/\]\((https?:\/\/[^\)]+)\)/g, (match, url) => {
        return `](${generatePlaceholder(url)})`;
    });



    // 8. Restore placeholders
    text = text.replace(/%%%PH(\d+)%%%/g, (match, index) => {
        return placeholders[parseInt(index, 10)];
    });

    return text;
}
