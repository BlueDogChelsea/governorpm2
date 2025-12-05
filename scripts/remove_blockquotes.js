const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data/pm2');

function processMarkdown(md) {
    let newMd = md;

    // Remove "> " at the start of the string
    newMd = newMd.replace(/^>\s+/gm, '');

    // Remove ">" that might be just ">" without space
    newMd = newMd.replace(/^>\n/gm, '\n');

    // Also handle cases where ">" is preceded by a newline in the string but not caught by ^
    newMd = newMd.replace(/\n>\s*/g, '\n');

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
