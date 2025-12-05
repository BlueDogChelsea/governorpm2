const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/pm2');

function processMarkdown(md) {
    let newMd = md;

    // 1. Remove {width=...} and {height=...} attributes
    // Matches: {width="..." height="..."} or {width=...} or {height=...}
    // We replace them with empty string.
    newMd = newMd.replace(/\{width=.*?\}/g, '');
    newMd = newMd.replace(/\{height=.*?\}/g, '');

    // 2. Normalize Figure Captions
    // Goal: **Fig X.Y** Caption text
    // Patterns found:
    // **Fig X.Y**
    // **Fig. X.Y**
    // **Fig X.Y** Caption
    // > **Fig X.Y** Caption

    // Regex to find "Fig X.Y" with various prefixes/suffixes and normalize it
    // We look for **Fig (or Fig.) X.Y**
    newMd = newMd.replace(/\*\*\s*Fig\.?\s+(\d+)[._](\d+)\s*\*\*/g, '**Fig $1.$2**');

    // Ensure space after **Fig X.Y** if followed by text (and not newline)
    newMd = newMd.replace(/(\*\*Fig\s+\d+\.\d+\*\*)(?!\s)/g, '$1 ');

    // Remove duplicate asterisks if any (e.g. ****Fig X.Y****)
    newMd = newMd.replace(/\*{3,}Fig/g, '**Fig');
    newMd = newMd.replace(/\d+\*{3,}/g, (match) => match.replace(/\*{3,}/, '**'));

    return newMd;
}

function processFiles() {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        console.log(`Processing ${file}...`);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(content);
            let modified = false;

            if (json.sections) {
                json.sections.forEach(section => {
                    if (section.markdown) {
                        const original = section.markdown;
                        const processed = processMarkdown(original);
                        if (original !== processed) {
                            section.markdown = processed;
                            modified = true;
                        }
                    }
                });
            } else if (json.markdown) {
                // Handle flat structure if any (though mostly sections)
                const original = json.markdown;
                const processed = processMarkdown(original);
                if (original !== processed) {
                    json.markdown = processed;
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
                console.log(`  Updated ${file}`);
            } else {
                console.log(`  No changes for ${file}`);
            }

        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    });
}

processFiles();
