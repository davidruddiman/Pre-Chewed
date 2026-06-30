# Pre-Chewed™

> Chew documents. Spit out clean text. Copy. Paste. Ask AI.

**[Try it now](https://davidruddiman.github.io/Pre-Chewed)** - runs entirely in your browser, nothing uploaded, no account required.

---

## What it does

AI models work within a finite context window. Every token spent on formatting noise is a token wasted. PDFs, Word documents, PowerPoint presentations, and Excel spreadsheets were built for humans and printers, not for machines. When you feed them raw into Claude, ChatGPT, Gemini, or any other AI tool, the model receives fonts, layout instructions, image data, XML encoding overhead, and page decorations before it reaches a single word of your actual content.

Pre-Chewed strips all of that out and gives the model exactly what it needs - clean, structured plain text - and nothing more. Everything runs in your browser. Nothing is ever uploaded or sent anywhere.

---

## Supported file types

| Format | Extension | Method |
|---|---|---|
| PDF (text-based) | .pdf | PDF.js text layer extraction |
| PDF (scanned) | .pdf | Tesseract.js OCR via WebAssembly |
| Word | .docx | mammoth.js |
| PowerPoint | .pptx | JSZip + XML parsing, slide by slide |
| Excel | .xlsx | SheetJS - all sheets as Markdown tables |

---

## Works with every major AI tool

Paste your Pre-Chewed output directly into:

**Claude · ChatGPT · Gemini · Microsoft Copilot · Perplexity · Grok · Mistral · Meta AI · DeepSeek · Llama · NotebookLM · You.com**

Or into any API, automation workflow, or pipeline that accepts plain text.

---

## Real-world results

| Document type | Before | After | Reduction | Notes |
|---|---|---|---|---|
| 146-page scanned PDF | 380,000 tokens | 92,000 tokens | 76% | Vision processing vs OCR text |
| Word / PowerPoint / Excel | Varies by file size | Extracted text only | 50–90% | XML and layout overhead removed |
| Text-based PDF | Same as output | Same as output | Minimal | AI extracts the same text layer - value is compatibility and structure |

**Scanned PDFs save the most.** When you upload a scanned PDF directly to Claude or ChatGPT, every page is processed as an image at approximately 1,600 tokens per page via vision - regardless of how much text is on the page. Pre-Chewed runs OCR locally and produces clean text at a fraction of that cost.

**Office files save significantly.** Word, PowerPoint, and Excel files carry substantial XML overhead - style sheets, theme data, relationship files, shared string tables - that the AI processes but does not need. Pre-Chewed removes all of it.

**Text-based PDFs: the value is compatibility, not token reduction.** When you upload a clean text PDF as an attachment, the AI extracts roughly the same text Pre-Chewed does. The token count before and after is similar. The value here is different: reliable structure extraction, consistent heading and table detection, and compatibility with tools, APIs, and automation workflows that do not accept PDF files.

---

## Features

- **PDF, Word, PowerPoint, and Excel** - all four run locally in your browser
- **OCR for scanned PDFs** - Tesseract.js WebAssembly, entirely on your device
- **Structure preserved** - headings, bullet points, numbered lists, and tables as clean Markdown
- **PowerPoint** - slide-by-slide extraction with slide numbers and titles as headings
- **Excel** - every sheet extracted as a Markdown table with sheet name headings
- **Header and footer stripping** - removes repeated page elements across long documents
- **Page range selection** - convert specific pages rather than the whole document (PDFs only)
- **Token comparison** - honest before and after estimate per file type so you see what you saved
- **Lifetime token meter** - odometer that builds across every document you convert, stored on your device
- **Cost estimate** - running dollar estimate based on Claude Sonnet input pricing
- **AI memory prompt** - copyable system prompt to paste into your AI tool so it reminds you to pre-chew every time
- **Installable as a PWA** - add to your phone home screen or desktop, works offline
- **100% private** - nothing leaves your device, ever
- **Open source** - read the code, verify the privacy claims, fork it

---

## Token estimates

Each file type uses a heuristic for the "before" estimate that reflects what the AI would actually consume if you uploaded the raw file directly:

| Type | Before heuristic | Reasoning |
|---|---|---|
| PDF (text) | Raw extracted text ÷ 4 | AI extracts the same text layer - honest, no inflation |
| PDF (scanned) | 1,600 tokens × page count | Vision processing rate used by Claude and ChatGPT per page |
| Word (.docx) | File size ÷ 8 | DOCX is a ZIP of XML: styles, themes, numbering, relationships |
| PowerPoint (.pptx) | Max of (800 × slides) or (file size ÷ 10) | Slides rendered visually by most AIs, similar to scanned pages |
| Excel (.xlsx) | File size ÷ 6 | Shared strings table and cell reference XML is verbose |

After tokens are always calculated as output text length ÷ 4. Before is always at least equal to after - the meter never shows a negative saving. For text-based PDFs where before and after are equal, the pill reads "Compatible with all tools" rather than a percentage.

---

## Privacy

Pre-Chewed's privacy guarantee ends at your clipboard.

File reading, text extraction, and OCR all happen locally on your device using WebAssembly libraries that are cached after the first load. No data is sent to any server at any point during conversion.

Once you paste the output into Claude, ChatGPT, Gemini, Microsoft Copilot, Perplexity, or any other AI tool, that platform's own privacy policy applies from that point on.

Pre-Chewed removes images and layout data, but the underlying text remains subject to its original copyright. If your document contains proprietary or third-party content, it is your responsibility to ensure you have the right to share it with whichever AI tool you use.

Pre-Chewed uses Cloudflare Web Analytics to track anonymous page visit counts and load performance. No cookies, no personal data, no IP storage, no cross-site tracking. This is used only to understand how many people are using the app and has no connection to your documents or their content, which never leave your browser.

---

## How it works

**Text-based PDFs** - PDF.js extracts the text layer with full positional metadata: coordinates, font sizes, and font names. Pre-Chewed uses that metadata to reconstruct document structure. Headings are identified by font size relative to the document median. Lines are grouped by Y-axis proximity scaled to font size. A second pass merges consecutive heading fragments that PDF.js returns word-by-word for large display text.

**Scanned PDFs** - Each page is rendered to canvas at 2x resolution via PDF.js, then passed to Tesseract.js - a WebAssembly port of Google's Tesseract OCR engine - running locally in the browser. Auto-detection samples up to three pages and measures average extractable characters to decide which path to take.

**Word documents (.docx)** - mammoth.js converts the DOCX XML structure to clean plain text, preserving headings and list structure. No cloud service involved.

**PowerPoint presentations (.pptx)** - JSZip extracts the ZIP archive, DOMParser reads each slide's XML in order, and slides are output with slide number and title as Markdown headings.

**Excel spreadsheets (.xlsx)** - SheetJS reads the entire workbook, iterates every sheet, filters empty rows, and outputs each sheet as a Markdown table. Multi-sheet workbooks include a heading per sheet.

---

## Security

| Control | Detail |
|---|---|
| File validation | Extension, MIME type, and magic bytes check for PDFs |
| File size cap | 100MB maximum, enforced client-side before any processing |
| No XSS vectors | All output written via textContent, never innerHTML |
| Input sanitisation | Page range input capped at 100 characters, 50 segments |
| No network calls | Zero external requests after the initial library load |

---

## Tech stack

| Library | Version | Purpose |
|---|---|---|
| PDF.js | 3.11.174 | PDF text extraction and page rendering |
| Tesseract.js | 5.0.4 | OCR for scanned documents |
| mammoth.js | 1.6.0 | Word (.docx) conversion |
| JSZip | 3.10.1 | PowerPoint (.pptx) ZIP extraction |
| SheetJS | 0.18.5 | Excel (.xlsx) workbook parsing |

All five libraries are loaded from cdnjs.cloudflare.com and cached by the service worker after the first load. Subsequent visits are instant and work without an internet connection.

---

## Known limitations

- Password-protected files are not supported
- Multi-column PDF layouts may not extract in strict reading order
- OCR accuracy depends on scan quality
- OCR is English-only in the default build
- PPTX images, charts, and embedded media are not extracted - text content only
- Older .xls (Excel 97–2003) format is not supported - open in Excel and save as .xlsx first
- URL conversion is not yet supported

---

## Contributing

Pull requests are welcome. If you find a document type that converts poorly, open an issue with a description of the structure.

---

## License

MIT. Free to use, modify, and share.

© 2025 David Ruddiman. All rights reserved.
