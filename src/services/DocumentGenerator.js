import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } from 'docx'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import htmlToPdfmake from 'html-to-pdfmake'

// Initialize pdfMake fonts
if (pdfMake.vfs === undefined && pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs
}

// --- PM² Styling Constants ---
const PM2_COLORS = {
    HeadingBlue: '#005A9C',      // Section H2
    SubheadingBlue: '#2E75B6',   // Subsection H3
    AccentOrange: '#C56A00',     // Project Name
    BodyText: '#333333',         // Standard text
    Divider: '#D0D0D0',          // Divider lines
    MetaText: '#666666',         // Metadata (grey)
    Label: '#333333'             // Field Labels
}

const PM2_FONTS = {
    Primary: 'Roboto, Segoe UI, Calibri, sans-serif'
}

const PM2_LAYOUT = {
    Margins: {
        PDF: [70, 85, 70, 70], // approx 2.5-3cm
        DOCX: { top: 1701, bottom: 1417, left: 1417, right: 1417 } // Twips (1cm = 567)
    }
}

const DocumentGenerator = {
    /**
     * Generates a document (PDF, DOCX, or HTML) based on data, schema, and template.
     * @param {Object} data - The flat key-value data from the artefact.
     * @param {Array} schema - The schema definition (sections and fields).
     * @param {Object} template - The template definition.
     * @param {string} format - 'pdf', 'docx', or 'html'.
     * @param {string} fileName - Output filename (ignored for html).
     * @returns {Promise<string|void>} Returns HTML string if format is html, otherwise downloads file.
     */
    generateDocument: async (data, schema, template, format, fileName) => {
        const sectionsToRender = getSectionsToRender(schema, template)
        const projectMetadata = getProjectMetadata(data)

        if (format === 'pdf') {
            await generatePdf(data, sectionsToRender, template, fileName, projectMetadata)
        } else if (format === 'docx') {
            await generateDocx(data, sectionsToRender, template, fileName, projectMetadata)
        } else if (format === 'html') {
            return generateHtml(data, sectionsToRender, template, projectMetadata)
        } else {
            console.error('Unsupported format:', format)
        }
    }
}

// --- Helpers ---

const getSectionsToRender = (schema, template) => {
    // Strategy 1: Use Artefact Sections (Single Source of Truth)
    if (template.useArtefactSections) {
        return schema.map((s, index) => ({
            heading: s.title,
            fields: s.fields,
            // Always page break before sections except the first one (which follows title page)
            pageBreak: template.pageBreakBetweenSections && index > 0 ? 'before' : undefined
        }))
    }

    // Strategy 2: Use Template Definition (Legacy/Override)
    if (template.sections) {
        return template.sections.map((t, index) => {
            const s = schema.find(x => x.id === t.includeFieldsFrom)
            return {
                heading: t.heading || s?.title || 'Unknown Section',
                fields: s?.fields || [],
                pageBreak: t.pageBreakBefore || (template.pageBreakBetweenSections && index > 0) ? 'before' : undefined
            }
        })
    }

    return []
}

const getProjectMetadata = (data) => {
    // Try to find project name from common keys in data
    const projectName = data['Project Name'] || data.project_name || data.projectName || data.project_title || "Project Name"
    const version = data['Version'] || data.version || "1.0"

    return {
        projectName: projectName,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        version: version,
        templateVersion: "PM² v3.0.1"
    }
}

const getLabel = (field) => {
    // Ensure label is clean 
    return field.label ? field.label.replace(/:$/, '') : ''
}

// --- HTML Generation ---

const generateHtml = (data, sections, template, meta) => {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${template.title}</title>
        <style>
            @page { margin: 2.5cm; }
            body { 
                font-family: ${PM2_FONTS.Primary}; 
                margin: 0 auto; 
                line-height: 1.4; 
                color: ${PM2_COLORS.BodyText};
                max-width: 900px;
                background: white;
            }
            
            /* Title Page */
            .title-page {
                height: 90vh;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                padding-top: 150px;
                page-break-after: always;
                border-bottom: none;
            }
            .title-main {
                font-size: 32px;
                font-weight: bold;
                color: ${PM2_COLORS.BodyText};
                text-align: center;
                margin-bottom: 20px;
            }
            .title-sub {
                font-size: 24px;
                font-weight: 600;
                color: ${PM2_COLORS.AccentOrange};
                text-align: center;
                margin-bottom: auto;
            }
            .meta-info {
                font-size: 11pt;
                color: ${PM2_COLORS.MetaText};
                text-align: right;
                margin-top: auto;
                border-top: 1px solid ${PM2_COLORS.Divider};
                padding-top: 10px;
            }
            .footer-branding {
                font-size: 10pt;
                color: ${PM2_COLORS.MetaText};
                text-align: center;
                margin-top: 20px;
            }

            /* Content Styles */
            h1 { display: none; } /* Original H1 hidden, used title page instead */
            
            h2 { 
                color: ${PM2_COLORS.HeadingBlue}; 
                font-size: 18pt; 
                font-weight: bold;
                margin-top: 32px; 
                margin-bottom: 16px; 
                border-bottom: 1px solid ${PM2_COLORS.Divider};
                padding-bottom: 4px;
                page-break-after: avoid;
            }
            
            h3 { 
                color: ${PM2_COLORS.SubheadingBlue}; 
                margin-top: 20px; 
                margin-bottom: 10px;
                font-size: 14pt;
                font-weight: 600;
                page-break-after: avoid;
            }
            
            h4 { 
                color: #444; 
                margin-top: 16px; 
                font-size: 11pt; 
                font-weight: bold; 
                page-break-after: avoid;
            }
            
            .field-pair { 
                margin-bottom: 14px; 
            }
            .field-label { 
                font-weight: 600; 
                color: ${PM2_COLORS.Label}; 
                display: block; 
                margin-bottom: 2px;
                font-size: 11pt;
            }
            .field-value { 
                font-size: 11pt;
                color: ${PM2_COLORS.BodyText};
                min-height: 1.2em;
            }
            
            ul, ol { margin-left: 24px; margin-bottom: 10px; margin-top: 4px; }
            li { margin-bottom: 4px; padding-left: 4px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background-color: #f5f5f5; font-weight: bold; color: ${PM2_COLORS.HeadingBlue}; }
        </style>
    </head>
    <body class="pm2-document">
        
        <!-- Title Page -->
        <div class="title-page">
            <div class="title-main">${template.title}</div>
            <div class="title-sub">${meta.projectName}</div>
            
            <div class="meta-info">
                <div><strong>Date:</strong> ${meta.date}</div>
                <div><strong>Version:</strong> ${meta.version}</div>
                <div><strong>Template:</strong> ${meta.templateVersion}</div>
            </div>
            <div class="footer-branding">
                This document is aligned with the PM² Project Management Methodology.
            </div>
        </div>

        <!-- Content -->
    `

    sections.forEach(section => {
        html += `<h2>${section.heading}</h2>`

        const groups = groupFields(section.fields)

        if (Object.keys(groups).length > 0) {
            Object.keys(groups).forEach(groupName => {
                if (groupName !== '_ungrouped') {
                    html += `<h3>${groupName}</h3>`
                }

                let currentSubGroup = null
                groups[groupName].forEach(field => {
                    if (field.subGroup && field.subGroup !== currentSubGroup) {
                        currentSubGroup = field.subGroup
                        html += `<h4>${currentSubGroup}</h4>`
                    }
                    html += renderHtmlField(field, data[field.key])
                })
            })
        } else {
            section.fields.forEach(field => {
                html += renderHtmlField(field, data[field.key])
            })
        }
    })

    html += `</body></html>`
    return html
}

const renderHtmlField = (field, value) => {
    if (isEmpty(value) && !['costMatrix', 'pscMatrix', 'approval'].includes(field.type)) return ''

    // SPECIAL TYPES
    if (field.type === 'costMatrix') {
        return renderHtmlCostMatrix(value)
    }

    if (field.type === 'pscMatrix') {
        return renderHtmlPscMatrix(value)
    }

    if (field.type === 'approval') {
        return renderHtmlApproval(value)
    }

    if (field.type === 'table') {
        return renderHtmlTable(field, value)
    }

    if (field.type === 'list') {
        const list = Array.isArray(value) ? value : []
        if (list.length === 0) return ''
        return `
            <div class="field-pair">
                <span class="field-label">${getLabel(field)}</span>
                <ul class="field-value">
                    ${list.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `
    }

    let content = value
    // Check if rich text
    const isRich = field.type.includes('rich') || field.type === 'textarea'
    if (!isRich && typeof value === 'string' && !value.includes('<')) {
        content = value.replace(/\n/g, '<br>')
    }

    // For rich text, if it doesn't wrap with paragraphs, just leave it. 
    // The WYSIWYG editor usually outputs HTML.

    return `
        <div class="field-pair">
            <span class="field-label">${getLabel(field)}</span>
            <div class="field-value">${content}</div>
        </div>
    `
}

const renderHtmlTable = (field, rows) => {
    const safeRows = Array.isArray(rows) ? rows : []
    if (safeRows.length === 0) return ''

    const headers = field.columns.map(c => `<th>${c.label}</th>`).join('')
    const body = safeRows.map(row => {
        const cells = field.columns.map(c => `<td>${row[c.key] || ''}</td>`).join('')
        return `<tr>${cells}</tr>`
    }).join('')

    return `
        <div class="field-pair">
            <span class="field-label">${getLabel(field)}</span>
            <table>
                <thead><tr>${headers}</tr></thead>
                <tbody>${body}</tbody>
            </table>
        </div>
    `
}

const renderHtmlCostMatrix = (costItems) => {
    const { matrix, years, categories } = calculateCostMatrix(costItems)
    const grandTotal = categories.reduce((sum, cat) => sum + matrix[cat].total, 0)

    let html = `
        <div class="field-pair">
            <span class="field-label">Projected Costs Matrix</span>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        ${years.map(y => `<th style="text-align:right">${y}</th>`).join('')}
                        <th style="text-align:right">Total</th>
                    </tr>
                </thead>
                <tbody>
    `

    categories.forEach(cat => {
        html += `<tr><td>${cat}</td>`
        years.forEach(y => {
            const val = matrix[cat][y]
            html += `<td style="text-align:right">${val > 0 ? val.toLocaleString() : '-'}</td>`
        })
        html += `<td style="text-align:right"><strong>${matrix[cat].total > 0 ? matrix[cat].total.toLocaleString() : '-'}</strong></td></tr>`
    })

    // Footer
    html += `<tr style="background:#f0f0f0; font-weight:bold;"><td>GRAND TOTAL</td>`
    years.forEach(y => {
        const yTotal = categories.reduce((sum, cat) => sum + matrix[cat][y], 0)
        html += `<td style="text-align:right">${yTotal > 0 ? yTotal.toLocaleString() : '-'}</td>`
    })
    html += `<td style="text-align:right">${grandTotal.toLocaleString()}</td></tr>`

    html += `</tbody></table></div>`
    return html
}

// --- PDF Generation ---

const generatePdf = async (data, sections, template, fileName, meta) => {
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: PM2_LAYOUT.Margins.PDF,
        content: [],
        styles: {
            titleMain: { fontSize: 26, bold: true, color: PM2_COLORS.BodyText, alignment: 'center', margin: [0, 150, 0, 20] },
            titleSub: { fontSize: 20, bold: true, color: PM2_COLORS.AccentOrange, alignment: 'center', margin: [0, 0, 0, 50] },
            metaInfo: { fontSize: 10, color: PM2_COLORS.MetaText, alignment: 'right', margin: [0, 5, 0, 0] },
            footerBranding: { fontSize: 9, italics: true, color: PM2_COLORS.MetaText, alignment: 'center', margin: [0, 20, 0, 0] },

            sectionHeader: { fontSize: 16, bold: true, color: PM2_COLORS.HeadingBlue, margin: [0, 20, 0, 10] }, // H2
            groupHeader: { fontSize: 13, bold: true, color: PM2_COLORS.SubheadingBlue, margin: [0, 15, 0, 5] },   // H3
            subGroupHeader: { fontSize: 11, bold: true, color: PM2_COLORS.BodyText, margin: [0, 10, 0, 5] },    // H4

            fieldLabel: { fontSize: 11, bold: true, color: PM2_COLORS.Label, margin: [0, 8, 0, 2] },
            fieldValue: { fontSize: 11, color: PM2_COLORS.BodyText, margin: [0, 0, 0, 5], lineHeight: 1.3 },

            htmlContent: { fontSize: 11, color: PM2_COLORS.BodyText, lineHeight: 1.3, margin: [0, 0, 0, 5] }
        },
        defaultStyle: {
            font: 'Roboto' // pdfmake uses Roboto by default
        }
    }

    // --- Title Page ---
    docDefinition.content.push({ text: template.title, style: 'titleMain' })
    docDefinition.content.push({ text: meta.projectName, style: 'titleSub' })

    // Spacer to push meta to bottom (approximate)
    docDefinition.content.push({ text: ' ', margin: [0, 180, 0, 0] })

    // Divider line
    docDefinition.content.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 450, y2: 5, lineWidth: 1, lineColor: PM2_COLORS.Divider }] })

    docDefinition.content.push({ text: `Date: ${meta.date}`, style: 'metaInfo' })
    docDefinition.content.push({ text: `Version: ${meta.version}`, style: 'metaInfo' })
    docDefinition.content.push({ text: `Template: ${meta.templateVersion}`, style: 'metaInfo' })

    docDefinition.content.push({ text: 'This document is aligned with the PM² Project Management Methodology.', style: 'footerBranding' })

    // Page Break after Title Page
    docDefinition.content.push({ text: '', pageBreak: 'after' })

    // --- Content Sections ---
    sections.forEach(section => {
        // Section Header (H2)
        docDefinition.content.push({
            text: section.heading,
            style: 'sectionHeader',
            pageBreak: section.pageBreak // Handle optional breaks
        })

        // Divider line under Section Header
        docDefinition.content.push({
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: PM2_COLORS.Divider }],
            margin: [0, 0, 0, 10]
        })

        const groups = groupFields(section.fields)

        if (Object.keys(groups).length > 0) {
            Object.keys(groups).forEach(groupName => {
                if (groupName !== '_ungrouped') {
                    docDefinition.content.push({ text: groupName, style: 'groupHeader' })
                }

                let currentSubGroup = null
                groups[groupName].forEach(field => {
                    if (field.subGroup && field.subGroup !== currentSubGroup) {
                        currentSubGroup = field.subGroup
                        docDefinition.content.push({ text: currentSubGroup, style: 'subGroupHeader' })
                    }
                    renderPdfField(docDefinition.content, field, data[field.key])
                })
            })
        } else {
            section.fields.forEach(field => {
                renderPdfField(docDefinition.content, field, data[field.key])
            })
        }
    })

    pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`)
}

const renderPdfField = (contentArray, field, value) => {
    if (isEmpty(value) && !['costMatrix', 'pscMatrix', 'approval'].includes(field.type)) return

    // Special Types
    if (field.type === 'costMatrix') {
        const { matrix, years, categories } = calculateCostMatrix(value)
        contentArray.push({ text: 'Projected Costs Matrix', style: 'fieldLabel' })

        const tableBody = []
        // Header
        const headerRow = [
            { text: 'Category', bold: true, fillColor: '#f3f4f6' },
            ...years.map(y => ({ text: y, bold: true, alignment: 'right', fillColor: '#f3f4f6' })),
            { text: 'Total', bold: true, alignment: 'right', fillColor: '#f3f4f6' }
        ]
        tableBody.push(headerRow)

        // Rows
        categories.forEach(cat => {
            const row = [
                { text: cat, style: 'tableCell' },
                ...years.map(y => ({ text: matrix[cat][y] > 0 ? matrix[cat][y].toLocaleString() : '-', alignment: 'right', style: 'tableCell' })),
                { text: matrix[cat].total > 0 ? matrix[cat].total.toLocaleString() : '-', alignment: 'right', bold: true, style: 'tableCell' }
            ]
            tableBody.push(row)
        })

        // Grand Total Row
        const totalRow = [
            { text: 'GRAND TOTAL', bold: true, fillColor: '#f3f4f6', style: 'tableCell' },
            ...years.map(y => {
                const yTotal = categories.reduce((sum, cat) => sum + matrix[cat][y], 0)
                return { text: yTotal > 0 ? yTotal.toLocaleString() : '-', alignment: 'right', bold: true, fillColor: '#f3f4f6', style: 'tableCell' }
            }),
            {
                text: categories.reduce((sum, cat) => sum + matrix[cat].total, 0).toLocaleString(),
                alignment: 'right', bold: true, fillColor: '#f3f4f6', style: 'tableCell'
            }
        ]
        tableBody.push(totalRow)

        contentArray.push({
            table: {
                headerRows: 1,
                widths: ['*', ...years.map(() => 'auto'), 'auto'],
                body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 5, 0, 15]
        })
        return
    }

    if (field.type === 'pscMatrix') {
        renderPdfPscMatrix(contentArray, value)
        return
    }

    if (field.type === 'approval') {
        renderPdfApproval(contentArray, value)
        return
    }

    if (field.type === 'table') {
        const rows = Array.isArray(value) ? value : []
        if (rows.length === 0) return

        contentArray.push({ text: getLabel(field), style: 'fieldLabel' })

        const tableBody = []
        // Header
        tableBody.push(field.columns.map(c => ({ text: c.label, bold: true, fillColor: '#f3f4f6' })))

        // Rows
        rows.forEach(r => {
            tableBody.push(field.columns.map(c => ({ text: r[c.key] || '', style: 'htmlContent' })))
        })

        contentArray.push({
            table: {
                headerRows: 1,
                widths: Array(field.columns.length).fill('*'),
                body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 5, 0, 15]
        })
        return
    }

    if (field.type === 'list') {
        const list = Array.isArray(value) ? value : []
        if (list.length === 0) return

        contentArray.push({ text: getLabel(field), style: 'fieldLabel' })
        contentArray.push({
            ul: list,
            margin: [0, 2, 0, 10],
            style: 'fieldValue'
        })
        return
    }

    contentArray.push({ text: getLabel(field), style: 'fieldLabel' })

    if (field.type === 'richtext' || field.type === 'textarea' || typeIsRich(field.type, value)) {
        if (value && (value.trim().startsWith('<') || field.type.includes('rich'))) {
            try {
                // Configure htmlToPdfmake to use our styles
                const htmlContent = htmlToPdfmake(value, {
                    defaultStyles: {
                        p: { margin: [0, 0, 0, 5], fontSize: 11, lineHeight: 1.3 },
                        h1: { fontSize: 16, bold: true, color: PM2_COLORS.HeadingBlue },
                        h2: { fontSize: 14, bold: true, color: PM2_COLORS.SubheadingBlue },
                        h3: { fontSize: 12, bold: true },
                        li: { margin: [0, 2, 0, 2] },
                        ul: { margin: [0, 5, 0, 10] },
                        table: { margin: [0, 5, 0, 10] },
                        td: { fontSize: 10 }
                    }
                })
                contentArray.push({ stack: htmlContent, style: 'htmlContent' })
            } catch (e) {
                console.warn('HTML parsing failed for PDF', e)
                contentArray.push({ text: extractText(value), style: 'fieldValue' })
            }
        } else {
            contentArray.push({ text: value, style: 'fieldValue' })
        }
    } else {
        contentArray.push({ text: value, style: 'fieldValue' })
    }
}

// --- DOCX Generation ---

const generateDocx = async (data, sections, template, fileName, meta) => {
    const docChildren = []

    // --- Title Page ---
    // Top Margin Spacer (approx 30% of page) - simulated by empty paragraphs or spacing
    docChildren.push(new Paragraph({ spacing: { before: 4000 } })) // ~200pt

    // Title
    docChildren.push(
        new Paragraph({
            text: template.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        })
    )

    // Project Name
    docChildren.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: meta.projectName,
                    size: 40, // 20pt
                    bold: true,
                    color: PM2_COLORS.AccentOrange.replace('#', '')
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 6000 } // Push metadata down
        })
    )

    // Metadata
    const createMetaLine = (label, val) => new Paragraph({
        children: [
            new TextRun({ text: label + ": ", color: "666666", size: 20 }),
            new TextRun({ text: val, color: "666666", size: 20 })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 50, after: 50 }
    })

    docChildren.push(createMetaLine("Date", meta.date))
    docChildren.push(createMetaLine("Version", meta.version))
    docChildren.push(createMetaLine("Template", meta.templateVersion))

    // Footer Branding
    docChildren.push(new Paragraph({
        text: "This document is aligned with the PM² Project Management Methodology.",
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ size: 18, color: "888888", italics: true })]
    }))

    // Page break before first content
    docChildren.push(new Paragraph({
        children: [new PageBreak()]
    }))


    // --- Sections ---

    sections.forEach(section => {
        // H2 Section
        docChildren.push(
            new Paragraph({
                text: section.heading,
                heading: HeadingLevel.HEADING_1, // Maps to H2 visually usually, specificed by logic below
                spacing: { before: 480, after: 240 }, // 24pt / 12pt
                border: {
                    bottom: { color: "D0D0D0", space: 1, value: BorderStyle.SINGLE, size: 6 }
                }
            })
        )

        const groups = groupFields(section.fields)

        if (Object.keys(groups).length > 0) {
            Object.keys(groups).forEach(groupName => {
                if (groupName !== '_ungrouped') {
                    docChildren.push(new Paragraph({
                        text: groupName,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 150 },
                    }))
                }

                let currentSubGroup = null
                groups[groupName].forEach(field => {
                    if (field.subGroup && field.subGroup !== currentSubGroup) {
                        currentSubGroup = field.subGroup
                        docChildren.push(new Paragraph({
                            text: currentSubGroup,
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 200, after: 100 },
                        }))
                    }
                    renderDocxField(docChildren, field, data[field.key])
                })
            })
        } else {
            section.fields.forEach(field => {
                renderDocxField(docChildren, field, data[field.key])
            })
        }
    })

    // Custom styles for DOCX
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22, // 11pt
                        color: PM2_COLORS.BodyText.replace('#', '')
                    },
                    paragraph: {
                        spacing: { line: 276, before: 0, after: 0 } // 1.2 line height
                    }
                },
                heading1: {
                    run: { font: "Calibri", size: 32, bold: true, color: PM2_COLORS.HeadingBlue.replace('#', '') }, // 16pt
                    paragraph: { spacing: { before: 480, after: 240 } }
                },
                heading2: {
                    run: { font: "Calibri", size: 28, bold: true, color: PM2_COLORS.SubheadingBlue.replace('#', '') }, // 14pt
                    paragraph: { spacing: { before: 360, after: 180 } }
                },
                heading3: {
                    run: { font: "Calibri", size: 24, bold: true, color: "444444" }, // 12pt
                    paragraph: { spacing: { before: 240, after: 120 } }
                },
                title: {
                    run: { font: "Calibri", size: 52, bold: true, color: "333333" }, // 26pt
                    paragraph: { spacing: { after: 400 } }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: PM2_LAYOUT.Margins.DOCX
                }
            },
            children: docChildren
        }]
    })

    const blob = await Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const renderDocxField = (childrenArray, field, value) => {
    if (isEmpty(value) && !['costMatrix', 'pscMatrix', 'approval'].includes(field.type)) return

    // Label
    childrenArray.push(new Paragraph({
        children: [
            new TextRun({
                text: getLabel(field),
                bold: true,
                color: PM2_COLORS.Label.replace('#', ''),
                size: 22 // 11pt
            })
        ],
        spacing: { before: 120, after: 60 } // ~6pt space
    }))

    // Special Types
    if (field.type === 'pscMatrix') {
        renderDocxPscMatrix(childrenArray, value)
        return
    }

    if (field.type === 'approval') {
        renderDocxApproval(childrenArray, value)
        return
    }

    if (field.type === 'costMatrix') {
        const { matrix, years, categories } = calculateCostMatrix(value)

        const headerRow = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: "Category", bold: true })] }),
                ...years.map(y => new TableCell({ children: [new Paragraph({ text: y, bold: true, alignment: AlignmentType.RIGHT })] })),
                new TableCell({ children: [new Paragraph({ text: "Total", bold: true, alignment: AlignmentType.RIGHT })] })
            ]
        })

        const dataRows = categories.map(cat => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(cat)] }),
                ...years.map(y => new TableCell({ children: [new Paragraph({ text: matrix[cat][y] > 0 ? matrix[cat][y].toLocaleString() : '-', alignment: AlignmentType.RIGHT })] })),
                new TableCell({ children: [new Paragraph({ text: matrix[cat].total > 0 ? matrix[cat].total.toLocaleString() : '-', bold: true, alignment: AlignmentType.RIGHT })] })
            ]
        }))

        const grandTotalRow = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: "GRAND TOTAL", bold: true })] }),
                ...years.map(y => {
                    const yTotal = categories.reduce((sum, cat) => sum + matrix[cat][y], 0)
                    return new TableCell({ children: [new Paragraph({ text: yTotal > 0 ? yTotal.toLocaleString() : '-', bold: true, alignment: AlignmentType.RIGHT })] })
                }),
                new TableCell({
                    children: [new Paragraph({
                        text: categories.reduce((sum, cat) => sum + matrix[cat].total, 0).toLocaleString(),
                        bold: true, alignment: AlignmentType.RIGHT
                    })]
                })
            ]
        })

        const table = new Table({
            rows: [headerRow, ...dataRows, grandTotalRow],
            width: { size: 100, type: WidthType.PERCENTAGE }
        })
        childrenArray.push(table)
        childrenArray.push(new Paragraph({ text: "" })) // Spacer
        return
    }

    if (field.type === 'table') {
        const rows = Array.isArray(value) ? value : []
        if (rows.length === 0) return

        const headerRow = new TableRow({
            children: field.columns.map(c => new TableCell({ children: [new Paragraph({ text: c.label, bold: true })] }))
        })

        const dataRows = rows.map(r => new TableRow({
            children: field.columns.map(c => new TableCell({ children: [new Paragraph(r[c.key] || '')] }))
        }))

        const table = new Table({
            rows: [headerRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE }
        })
        childrenArray.push(table)
        childrenArray.push(new Paragraph({ text: "" }))
        return
    }

    if (field.type === 'list') {
        const list = Array.isArray(value) ? value.filter(item => item && item.trim() !== '') : []
        if (list.length === 0) return

        // Label is already added at the top of the function

        list.forEach(item => {
            childrenArray.push(new Paragraph({
                text: item,
                bullet: { level: 0 }
            }))
        })
        return
    }

    // Value
    if (field.type === 'richtext' || field.type === 'textarea' || typeIsRich(field.type, value)) {
        if (value && value.trim().startsWith('<')) {
            const paragraphs = parseHtmlToDocx(value)
            childrenArray.push(...paragraphs)
        } else {
            const lines = String(value).split('\n')
            childrenArray.push(new Paragraph({
                children: lines.map((line, i) => new TextRun({
                    text: line,
                    break: i > 0 ? 1 : 0
                }))
            }))
        }
    } else {
        childrenArray.push(new Paragraph({
            children: [new TextRun({ text: String(value) })]
        }))
    }
}

// --- Utils ---

const groupFields = (fields) => {
    if (!fields) return {}
    const groups = {}

    // Check if any field has a group
    if (!fields.some(f => f.group)) return {}

    fields.forEach(field => {
        const groupName = field.group || '_ungrouped'
        if (!groups[groupName]) groups[groupName] = []
        groups[groupName].push(field)
    })

    if (Object.keys(groups).length === 1 && groups['_ungrouped']) return {}
    return groups
}

const isEmpty = (value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (value === '<p></p>') return true
    return false
}

const typeIsRich = (type, val) => {
    if (typeof val === 'string' && val.includes('<')) return true
    return false
}

const extractText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// HTML to DOCX Parser
const parseHtmlToDocx = (html) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const nodes = Array.from(doc.body.childNodes)
    const paragraphs = []

    nodes.forEach(node => {
        if (node.nodeName === 'P' || node.nodeName === 'DIV') {
            paragraphs.push(processMetrics(node))
        } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
            const isOrdered = node.nodeName === 'OL'
            Array.from(node.children).forEach((li, index) => {
                if (li.nodeName === 'LI') {
                    paragraphs.push(new Paragraph({
                        children: [
                            new TextRun({ text: li.textContent })
                        ],
                        bullet: !isOrdered ? { level: 0 } : undefined,
                        numbering: isOrdered ? { reference: "decimal-numbering", level: 0 } : undefined,
                        spacing: { before: 50, after: 50 }
                    }))
                }
            })
        } else if (node.nodeName === '#text') {
            if (node.textContent.trim()) {
                paragraphs.push(new Paragraph({ text: node.textContent.trim() }))
            }
        } else if (node.nodeName.startsWith('H')) {
            // Helper for inline H tags within rich text (rare but possible)
            paragraphs.push(new Paragraph({
                text: node.textContent,
                heading: HeadingLevel.HEADING_4
            }))
        }
    })

    return paragraphs
}

const calculateCostMatrix = (costItems) => {
    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    const categories = ['Solution Development', 'Maintenance', 'Infrastructure', 'Training', 'Change Management', 'Support', 'Other']
    const matrix = {}

    // Init
    categories.forEach(cat => {
        matrix[cat] = { total: 0 }
        years.forEach(y => matrix[cat][y] = 0)
    })

    // Calc
    if (Array.isArray(costItems)) {
        costItems.forEach(item => {
            if (!item || !item.category) return
            const amt = parseFloat(item.amount) || 0
            if (matrix[item.category] && matrix[item.category][item.year] !== undefined) {
                matrix[item.category][item.year] += amt
                matrix[item.category].total += amt
            }
        })
    }
    return { matrix, years, categories }
}

const processMetrics = (node) => {
    const runs = []
    const processChild = (child, isBold = false, isItalic = false) => {
        if (child.nodeName === '#text') {
            if (child.textContent) {
                runs.push(new TextRun({
                    text: child.textContent,
                    bold: isBold,
                    italics: isItalic
                }))
            }
        } else if (child.nodeName === 'STRONG' || child.nodeName === 'B') {
            child.childNodes.forEach(c => processChild(c, true, isItalic))
        } else if (child.nodeName === 'EM' || child.nodeName === 'I') {
            child.childNodes.forEach(c => processChild(c, isBold, true))
        } else if (child.nodeName === 'BR') {
            runs.push(new TextRun({ text: '', break: 1 }))
        } else {
            child.childNodes.forEach(c => processChild(c, isBold, isItalic))
        }
    }
    node.childNodes.forEach(child => processChild(child))
    return new Paragraph({
        children: runs,
        spacing: { after: 100 }
    })
}

export default DocumentGenerator

// --- New Renderers for PSC and Approval ---

const renderHtmlPscMatrix = (pscData) => {
    if (!pscData) return ''
    const rows = [
        { role: 'Project Owner', ...pscData.requestorSide?.po },
        { role: 'Business Manager', ...pscData.requestorSide?.bm },
        { role: 'Solution Provider', ...pscData.providerSide?.sp },
        { role: 'Project Manager', ...pscData.providerSide?.pm }
    ]

    let html = `
        <div class="field-pair">
            <span class="field-label">Project Roles & Responsibilities</span>
            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Responsibilities</th>
                    </tr>
                </thead>
                <tbody>
    `
    rows.forEach(r => {
        html += `<tr><td>${r.role || ''}</td><td>${r.name || ''}</td><td>${r.responsibilities || ''}</td></tr>`
    })
    html += `</tbody></table></div>`
    return html
}

const renderHtmlApproval = (approvalData) => {
    if (!approvalData) return ''
    return `
        <div class="field-pair" style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; background-color: #fafafa; margin-top: 20px;">
            <h4 style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Authorization</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <span class="field-label">Approver Name</span>
                    <div class="field-value">${approvalData.approverName || '-'}</div>
                </div>
                 <div>
                    <span class="field-label">Date</span>
                    <div class="field-value">${approvalData.approvalDate || '-'}</div>
                </div>
                <div style="grid-column: span 2;">
                    <span class="field-label">Signature</span>
                    <div class="field-value" style="font-family: 'Brush Script MT', cursive, serif; font-size: 1.2em; color: #005A9C;">
                        ${approvalData.signature ? '/s/ ' + approvalData.signature : '-'}
                    </div>
                </div>
            </div>
        </div>
    `
}

const renderPdfPscMatrix = (contentArray, pscData) => {
    if (!pscData) return
    const rows = [
        { role: 'Project Owner', ...pscData.requestorSide?.po },
        { role: 'Business Manager', ...pscData.requestorSide?.bm },
        { role: 'Solution Provider', ...pscData.providerSide?.sp },
        { role: 'Project Manager', ...pscData.providerSide?.pm }
    ]

    const tableBody = []
    tableBody.push([
        { text: 'Role', bold: true, fillColor: '#f3f4f6' },
        { text: 'Name', bold: true, fillColor: '#f3f4f6' },
        { text: 'Responsibilities', bold: true, fillColor: '#f3f4f6' }
    ])

    rows.forEach(r => {
        tableBody.push([
            { text: r.role || '', style: 'tableCell' },
            { text: r.name || '', style: 'tableCell' },
            { text: r.responsibilities || '', style: 'tableCell' }
        ])
    })

    contentArray.push({ text: 'Project Roles & Responsibilities', style: 'fieldLabel' })
    contentArray.push({
        table: {
            headerRows: 1,
            widths: ['30%', '30%', '40%'],
            body: tableBody
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 15]
    })
}

const renderPdfApproval = (contentArray, approvalData) => {
    if (!approvalData) return

    contentArray.push({
        stack: [
            { text: 'Authorization', style: 'sectionHeader', fontSize: 14, margin: [0, 0, 0, 10] },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { stack: [{ text: 'Approver Name', style: 'fieldLabel' }, { text: approvalData.approverName || '-', style: 'fieldValue' }], margin: [0, 5, 0, 5] },
                            { stack: [{ text: 'Date', style: 'fieldLabel' }, { text: approvalData.approvalDate || '-', style: 'fieldValue' }], margin: [0, 5, 0, 5] }
                        ],
                        [
                            {
                                colSpan: 2,
                                stack: [
                                    { text: 'Signature', style: 'fieldLabel' },
                                    { text: approvalData.signature ? '/s/ ' + approvalData.signature : '-', style: 'fieldValue', italics: true, color: '#005A9C', fontSize: 12, margin: [0, 5, 0, 5] }
                                ]
                            },
                            {}
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i) => i === 1 ? 1 : 0,
                    vLineWidth: () => 0,
                    hLineColor: '#eeeeee'
                }
            }
        ],
        margin: [0, 10, 0, 10],
        style: 'htmlContent', // reuse existing style or generic
        fillColor: '#fafafa'
    })
}

const renderDocxPscMatrix = (childrenArray, pscData) => {
    if (!pscData) return

    childrenArray.push(new Paragraph({
        children: [new TextRun({ text: "Project Roles & Responsibilities", bold: true, color: "333333" })],
        spacing: { before: 240, after: 120 }
    }))

    const rows = [
        { role: 'Project Owner', ...pscData.requestorSide?.po },
        { role: 'Business Manager', ...pscData.requestorSide?.bm },
        { role: 'Solution Provider', ...pscData.providerSide?.sp },
        { role: 'Project Manager', ...pscData.providerSide?.pm }
    ]

    const headerRow = new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Role", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Name", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Responsibilities", bold: true })] })
        ]
    })

    const dataRows = rows.map(r => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(r.role || '')] }),
            new TableCell({ children: [new Paragraph(r.name || '')] }),
            new TableCell({ children: [new Paragraph(r.responsibilities || '')] })
        ]
    }))

    const table = new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE }
    })
    childrenArray.push(table)
    childrenArray.push(new Paragraph({ text: "" }))
}

const renderDocxApproval = (childrenArray, approvalData) => {
    if (!approvalData) return

    // Container box simulation using a 1x1 table or just spacing
    const nameRun = new Paragraph({
        children: [
            new TextRun({ text: "Approver Name: ", bold: true }),
            new TextRun({ text: approvalData.approverName || '-' })
        ]
    })

    const dateRun = new Paragraph({
        children: [
            new TextRun({ text: "Date: ", bold: true }),
            new TextRun({ text: approvalData.approvalDate || '-' })
        ]
    })

    const sigRun = new Paragraph({
        children: [
            new TextRun({ text: "Signature: ", bold: true }),
            new TextRun({ text: approvalData.signature ? '/s/ ' + approvalData.signature : '-', italics: true, color: "005A9C" })
        ]
    })

    // Wrap in a table for border effect? Or just list them. A table looks cleaner.
    const table = new Table({
        rows: [
            new TableRow({ children: [new TableCell({ children: [nameRun] }), new TableCell({ children: [dateRun] })] }),
            new TableRow({ children: [new TableCell({ children: [sigRun], columnSpan: 2 })] })
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" }
        }
    })

    childrenArray.push(new Paragraph({
        children: [new TextRun({ text: "Authorization", bold: true, size: 28 })],
        spacing: { before: 360, after: 120 }
    }))
    childrenArray.push(table)
    childrenArray.push(new Paragraph({ text: "" }))
}
