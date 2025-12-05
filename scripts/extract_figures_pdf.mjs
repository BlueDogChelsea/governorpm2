import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_PATH = path.join(__dirname, '../public/pm2/guides/pm2-project-guide.pdf');
const PAGES_DIR = path.join(__dirname, '../public/pm2/pages');
const FIGURES_DIR = path.join(__dirname, '../public/pm2/figures');

if (!fs.existsSync(FIGURES_DIR)) {
    fs.mkdirSync(FIGURES_DIR, { recursive: true });
}

async function extractFigures() {
    console.log('Loading PDF...');
    const data = new Uint8Array(fs.readFileSync(PDF_PATH));
    const standardFontDataUrl = path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts/');
    const loadingTask = pdfjsLib.getDocument({
        data: data,
        standardFontDataUrl: standardFontDataUrl
    });
    const pdfDocument = await loadingTask.promise;

    console.log(`PDF loaded. Pages: ${pdfDocument.numPages}`);

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();

        // Find captions
        const captions = [];
        for (const item of textContent.items) {
            const text = item.str.trim();
            // Match "Fig X.Y" or "Fig. X.Y"
            if (/^Fig\.?\s+\d+[._]\d+/i.test(text)) {
                captions.push(item);
            }
        }

        if (captions.length === 0) continue;

        // Load corresponding image
        const pageFilename = `page-${String(pageNum).padStart(3, '0')}.png`;
        const imagePath = path.join(PAGES_DIR, pageFilename);

        if (!fs.existsSync(imagePath)) {
            console.warn(`Image not found for page ${pageNum}: ${imagePath}`);
            continue;
        }

        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;

        // Calculate scale factors
        const scaleX = imgWidth / viewport.width;
        const scaleY = imgHeight / viewport.height;

        console.log(`Processing Page ${pageNum} (${captions.length} figures)...`);

        for (const captionItem of captions) {
            const text = captionItem.str.trim();
            const match = text.match(/Fig\.?\s+(\d+)[._](\d+)/i);
            if (!match) continue;

            const figNum = `fig-${match[1]}-${match[2]}`;

            const tx = captionItem.transform;
            const pdfX = tx[4];
            const pdfY = tx[5];
            const pdfHeight = captionItem.height || (Math.abs(tx[3]));

            const captionTopPdf = viewport.height - (pdfY + pdfHeight);
            const captionTopImg = Math.floor(captionTopPdf * scaleY);

            console.log(`  Extracting ${figNum}... Caption Top: ${captionTopImg}`);

            const searchRegion = await image
                .clone()
                .extract({ left: 0, top: 0, width: imgWidth, height: captionTopImg })
                .raw()
                .toBuffer({ resolveWithObject: true });

            const { data, info } = searchRegion;
            const width = info.width;
            const height = info.height;
            const channels = info.channels;

            // Pixel Analysis: Scan from bottom (height-1) upwards

            // 1. Skip whitespace (gap between caption and figure)
            let figureBottom = -1;

            const isRowEmpty = (y) => {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * channels;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    if (r < 240 || g < 240 || b < 240) {
                        return false;
                    }
                }
                return true;
            };

            for (let y = height - 1; y >= 0; y--) {
                if (!isRowEmpty(y)) {
                    figureBottom = y;
                    break;
                }
            }

            if (figureBottom === -1) {
                console.log(`    Skipping ${figNum}: No content found above caption.`);
                continue;
            }

            // 2. Scan upwards to find the top of the figure
            let figureTop = 0;
            let whitespaceCount = 0;
            const whitespaceThreshold = 20;

            for (let y = figureBottom; y >= 0; y--) {
                if (isRowEmpty(y)) {
                    whitespaceCount++;
                    if (whitespaceCount > whitespaceThreshold) {
                        figureTop = y + whitespaceThreshold;
                        break;
                    }
                } else {
                    whitespaceCount = 0;
                }
            }

            // 3. Refine Crop (Horizontal)
            let cropLeft = 0;
            let cropRight = width;

            // Scan Left
            for (let x = 0; x < width; x++) {
                let colEmpty = true;
                for (let y = figureTop; y <= figureBottom; y++) {
                    const idx = (y * width + x) * channels;
                    if (data[idx] < 240 || data[idx + 1] < 240 || data[idx + 2] < 240) {
                        colEmpty = false;
                        break;
                    }
                }
                if (!colEmpty) {
                    cropLeft = x;
                    break;
                }
            }

            // Scan Right
            for (let x = width - 1; x >= 0; x--) {
                let colEmpty = true;
                for (let y = figureTop; y <= figureBottom; y++) {
                    const idx = (y * width + x) * channels;
                    if (data[idx] < 240 || data[idx + 1] < 240 || data[idx + 2] < 240) {
                        colEmpty = false;
                        break;
                    }
                }
                if (!colEmpty) {
                    cropRight = x + 1;
                    break;
                }
            }

            const cropWidth = cropRight - cropLeft;
            const cropHeight = figureBottom - figureTop + 1;

            if (cropHeight < 50 || cropWidth < 50) {
                console.log(`    Skipping ${figNum}: Too small (${cropWidth}x${cropHeight})`);
                continue;
            }

            console.log(`    Cropping ${figNum}: x=${cropLeft}, y=${figureTop}, w=${cropWidth}, h=${cropHeight}`);

            await image
                .clone()
                .extract({ left: cropLeft, top: figureTop, width: cropWidth, height: cropHeight })
                .toFile(path.join(FIGURES_DIR, `${figNum}.png`));
        }
    }
}

extractFigures().catch(err => console.error(err));
