/**
 * Extract text from a PDF buffer using pdf2json.
 * Replaces pdf-parse which has a build-time ENOENT bug on Vercel,
 * and pdfjs-dist which requires the 'canvas' native module.
 *
 * pdf2json's getRawTextContent() returns empty for some PDFs,
 * so we extract text from the raw Pages[].Texts[] structure directly.
 */

interface ExtractOptions {
  /** Only include text items with x < this value (filters out sidebars) */
  maxX?: number;
}

export async function extractPdfText(buffer: Buffer, options?: ExtractOptions): Promise<string> {
  const PDFParser = (await import("pdf2json")).default;

  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      const pages: string[] = [];

      for (const page of pdfData.Pages ?? []) {
        const texts: Array<{ x: number; y: number; text: string }> = [];
        for (const t of page.Texts ?? []) {
          const x = t.x ?? 0;
          // Filter by x-coordinate if maxX is set
          if (options?.maxX && x >= options.maxX) continue;

          const str = (t.R ?? [])
            .map((r: any) => {
              try { return decodeURIComponent(r.T ?? ""); }
              catch { return r.T ?? ""; }
            })
            .join("");
          if (str.trim()) {
            texts.push({ x, y: t.y ?? 0, text: str });
          }
        }

        // Group by y-position (same line = within 0.3 units)
        texts.sort((a, b) => a.y - b.y || a.x - b.x);
        const lines: string[] = [];
        let currentLine: string[] = [];
        let lastY = -999;

        for (const t of texts) {
          if (Math.abs(t.y - lastY) > 0.3) {
            if (currentLine.length > 0) {
              lines.push(currentLine.join(" "));
            }
            currentLine = [t.text];
            lastY = t.y;
          } else {
            currentLine.push(t.text);
          }
        }
        if (currentLine.length > 0) {
          lines.push(currentLine.join(" "));
        }

        pages.push(lines.join("\n"));
      }

      resolve(pages.join("\n"));
    });

    parser.on("pdfParser_dataError", (err: any) => {
      reject(new Error(err.parserError ?? "PDF parse failed"));
    });

    parser.parseBuffer(buffer);
  });
}
