const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/pm2');

async function updateJsonFiles() {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    console.log(`Found ${files.length} JSON files.`);

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        const processMarkdown = (md) => {
            // Regex to find image followed by caption "Fig X.Y"
            // Handles optional blockquote ">" before image and between image and caption
            // Handles optional attributes {width=...} after image
            // Handles text between image and caption (up to 1000 chars), ensuring no other image is skipped
            // Matches: > ![](...) {width=...} \n Some text... \n > **Fig 1.1**
            return md.replace(/(?:>\s*)?!\[\]\((.*?)\)(?:\{.*?\})?((?:(?!\[\])[\s\S]){0,1000}?)(?:>\s*)*\*\*Fig\s+(\d+)[._](\d+)/gi, (match, oldPath, gap, major, minor) => {
                const newPath = `/pm2/figures/fig-${major}-${minor}.png`;
                // Only log if we are actually changing it (ignore if already correct)
                if (oldPath !== newPath) {
                    console.log(`  Updating ${file}: Fig ${major}.${minor} -> ${newPath}`);
                    modified = true;
                    // Reconstruct the string. If the original had a > prefix, we might want to keep it?
                    // But usually we just want to replace the path.
                    // However, the match includes the prefix.
                    // Let's just return ![](...) + captionPart, but we need to handle the prefix if it was there.
                    // Actually, simpler: just replace the URL in the match?
                    // No, because we need to return the whole string.

                    // If the match started with >, we should probably preserve it?
                    // But the image path is inside the match.

                    // Let's look at the match structure.
                    // match is the whole string.
                    // oldPath is the URL.
                    // captionPart is the rest.

                    // If we just return `![](${newPath})${captionPart}`, we lose the leading `> ` if it existed.
                    // We need to check if match starts with `>`.
                    const prefix = match.trim().startsWith('>') ? '> ' : '';
                    // Wait, if match has `> ![]...`, then `prefix` should be `> `.
                    // But `captionPart` starts with `\n...`.

                    // Actually, let's just use the match string and replace the URL?
                    // But we need to make sure we are replacing the RIGHT URL (the one we found).
                    // Since we are inside a replace callback for that specific match, we can just replace the oldPath with newPath in the match string.
                    return match.replace(oldPath, newPath);
                }
                return match;
            });
        };

        if (content.sections) {
            content.sections = content.sections.map(section => {
                if (section.markdown) {
                    section.markdown = processMarkdown(section.markdown);
                }
                return section;
            });
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
            console.log(`  Saved updates to ${file}`);
        }
    }
}

updateJsonFiles();
