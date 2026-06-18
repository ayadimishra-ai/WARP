/**
 * Native PDF renderer: parses limited HTML and reproduces the prior CSS rules using jsPDF primitives.
 * Mirrors styling that was previously applied via createStyledContentStyles + html2canvas.
 * Supported: h1-h4, p, ul/ol (nested), li, blockquote, code/pre, a, table, strong/b.
 * Now uses embedded Roboto font (placed as /fonts/Roboto-Regular.ttf etc.) instead of built-in helvetica/courier.
 */
// Lightweight Roboto font loader (idempotent across multiple exports).
// We cache the base64 data once, then inject into every new jsPDF instance.
// Previous implementation only worked for the first document because fonts were added
// to that specific instance; subsequent docs saw the global promise resolved but did
// not receive the fonts. This cache-based approach fixes that.
interface RobotoCacheEntry {
  fileName: string;
  name: string;
  style: string;
  data: string; // base64
}
let __robotoCache: RobotoCacheEntry[] | null = null;
let __robotoLoading: Promise<void> | null = null;
const ensureRoboto = async (doc: any): Promise<void> => {
  if ((doc as any)._robotoLoaded) return; // this doc already has the fonts

  // If cached, just inject into this doc.
  if (__robotoCache) {
    const cache = __robotoCache as RobotoCacheEntry[]; // type assurance
    for (let i = 0; i < cache.length; i++) {
      const entry = cache[i];
      doc.addFileToVFS(entry.fileName, entry.data);
      doc.addFont(entry.fileName, entry.name, entry.style);
    }
    (doc as any)._robotoLoaded = true;
    return;
  }

  // If another call is already loading, await it then recurse (cache will be populated).
  if (__robotoLoading) {
    await __robotoLoading;
    return ensureRoboto(doc);
  }

  __robotoLoading = (async () => {
    const variants = [
      { path: "/fonts/Roboto-Regular.ttf", name: "Roboto", style: "normal" },
      { path: "/fonts/Roboto-Bold.ttf", name: "Roboto", style: "bold" },
      { path: "/fonts/Roboto-Italic.ttf", name: "Roboto", style: "italic" },
    ];
    const cache: RobotoCacheEntry[] = [];
    for (const v of variants) {
      try {
        const resp = await fetch(v.path);
        if (!resp.ok) continue; // skip missing font
        const buf = await resp.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++)
          binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        const fileName = v.path.split("/").pop()!;
        cache.push({ fileName, name: v.name, style: v.style, data: base64 });
      } catch {
        // ignore individual failures
      }
    }
    if (!cache.length) {
      console.warn(
        "Roboto TTF fonts not found in /public/fonts. Falling back to built-in fonts."
      );
      __robotoCache = null; // leave null so future attempts can retry (in case fonts appear later)
    } else {
      __robotoCache = cache;
    }
  })();

  await __robotoLoading;
  __robotoLoading = null;

  // If we successfully cached fonts, inject them now for this doc.
  if (__robotoCache) {
    const cache = __robotoCache as RobotoCacheEntry[];
    for (let i = 0; i < cache.length; i++) {
      const entry = cache[i];
      doc.addFileToVFS(entry.fileName, entry.data);
      doc.addFont(entry.fileName, entry.name, entry.style);
    }
    (doc as any)._robotoLoaded = true;
  }
};
const renderHtmlContentToPDF = async (
  doc: any,
  html: string,
  startY: number
): Promise<number> => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  let y = startY;
  const leftMargin = 10;
  const contentWidth = 190; // printable width
  const bottomMargin = 285; // page bottom guard

  const ensurePage = (needed = 0) => {
    if (y + needed > bottomMargin) {
      // bottom guard with dynamic height
      doc.addPage();
      y = 20;
    }
  };

  const drawHeading = (text: string, level: number) => {
    const styles: Record<
      number,
      {
        size: number;
        color: [number, number, number];
        bg?: [number, number, number] | null;
        align: "left" | "center";
        padTop: number;
        padBottom: number;
        extraGap: number;
      }
    > = {
      1: {
        size: 16,
        color: [0, 0, 0],
        bg: null,
        align: "left",
        padTop: 2,
        padBottom: 4,
        extraGap: 2,
      },
      2: {
        size: 14,
        color: [255, 255, 255],
        bg: [0, 0, 0],
        align: "center",
        padTop: 3,
        padBottom: 0,
        extraGap: 8,
      },
      3: {
        size: 14,
        color: [217, 119, 6],
        bg: null,
        align: "left",
        padTop: 0,
        padBottom: 4,
        extraGap: 2,
      },
      4: {
        size: 12,
        color: [50, 130, 184],
        bg: null,
        align: "left",
        padTop: 2,
        padBottom: 4,
        extraGap: 2,
      },
    };
    const s = styles[level] || styles[4];
    const clean = text.trim();
    if (!clean) return;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(s.size);
    const lineHeight = Math.round(s.size * 0.55); // proportional line spacing
    const lines = doc.splitTextToSize(clean, contentWidth);
    const contentHeight = lines.length * lineHeight;
    const blockHeight = s.padTop + contentHeight + s.padBottom;
    ensurePage(blockHeight + 4);
    if (s.bg) {
      doc.setFillColor(...s.bg);
      doc.rect(leftMargin, y, contentWidth, blockHeight, "F");
    }
    doc.setTextColor(...s.color);
    let cursorY = y + s.padTop + s.size * 0.3; // baseline adjust
    lines.forEach((ln: string, idx: number) => {
      if (s.align === "center") {
        doc.text(
          ln,
          leftMargin + contentWidth / 2,
          cursorY + idx * lineHeight,
          { align: "center" }
        );
      } else {
        doc.text(ln, leftMargin, cursorY + idx * lineHeight);
      }
    });
    y += blockHeight + s.extraGap;
    doc.setTextColor(0, 0, 0);
  };

  const drawParagraph = (elOrText: string | Element) => {
    y += 4;
    const isElement = typeof elOrText !== "string";
    const rawText = isElement
      ? (elOrText as Element).textContent || ""
      : elOrText;
    const trimmed = rawText.trim();
    if (!trimmed) return;

    // If element and contains leading <strong>/<b> treat as inline label
    if (isElement) {
      const el = elOrText as Element;
      // Collect inline tokens (very light tokenizer for strong/b + normal text)
      const tokens: { text: string; bold: boolean }[] = [];
      el.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          const t = node.textContent || "";
          if (t.trim()) tokens.push({ text: t, bold: false });
        } else if (node.nodeType === 1) {
          const tag = (node as Element).tagName.toLowerCase();
          const t = node.textContent || "";
          if (["strong", "b"].includes(tag)) {
            if (t.trim()) tokens.push({ text: t, bold: true });
          } else if (tag === "code") {
            if (t.trim()) tokens.push({ text: t, bold: false });
          } else {
            // Fallback: flatten nested
            const t2 = (node as Element).textContent || "";
            if (t2.trim()) tokens.push({ text: t2, bold: false });
          }
        }
      });

      if (tokens.length) {
        // Build lines manually with wrapping respecting bold width changes
        const fontSize = 11;
        doc.setFontSize(fontSize);
        const spaceWidth = doc.getTextWidth(" ");
        let currentLine: {
          segs: { text: string; bold: boolean }[];
          width: number;
        } = { segs: [], width: 0 };
        const lines: typeof currentLine[] = [];

        const flushLine = () => {
          if (currentLine.segs.length) {
            lines.push(currentLine);
            currentLine = { segs: [], width: 0 };
          }
        };

        const pushWord = (word: string, bold: boolean) => {
          doc.setFont("Roboto", bold ? "bold" : "normal");
          const w = doc.getTextWidth(word);
          const totalNeeded = (currentLine.width === 0 ? 0 : spaceWidth) + w;
          if (
            leftMargin + currentLine.width + totalNeeded >
            leftMargin + contentWidth
          ) {
            flushLine();
            doc.setFont("Roboto", bold ? "bold" : "normal");
            currentLine.segs.push({ text: word, bold });
            currentLine.width = w;
          } else {
            if (currentLine.width !== 0) {
              currentLine.segs.push({ text: " ", bold: false });
              currentLine.width += spaceWidth;
            }
            currentLine.segs.push({ text: word, bold });
            currentLine.width += w;
          }
        };

        tokens.forEach((tok) => {
          const words = tok.text.replace(/\s+/g, " ").split(" ");
          words.forEach((w) => {
            if (w) pushWord(w, tok.bold);
          });
        });
        flushLine();

        lines.forEach((line) => {
          ensurePage(10);
          let cursorX = leftMargin;
          line.segs.forEach((seg) => {
            doc.setFont("Roboto", seg.bold ? "bold" : "normal");
            doc.text(seg.text, cursorX, y);
            cursorX += doc.getTextWidth(seg.text);
          });
          y += 6;
        });
        y += 2; // paragraph spacing
        doc.setFont("Roboto", "normal");
        return;
      }
    }

    // Fallback simple paragraph
    doc.setFont("Roboto", "normal");
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(trimmed, contentWidth);
    lines.forEach((ln: string) => {
      ensurePage(10);
      doc.text(ln, leftMargin, y);
      y += 6;
    });
    y += 2;
  };

  const drawList = async (listEl: Element, ordered: boolean, level = 0) => {
    // set a smaller global font-size for list content
    doc.setFontSize(10);

    const items = Array.from(listEl.children).filter(
      (c) => c.tagName.toLowerCase() === "li"
    );
    const cssIndents = [12, 16, 20, 24, 28];
    const baseIndent = cssIndents[Math.min(level, cssIndents.length - 1)];

    // smaller line height to match font-size 10
    const lineHeight = 5; // previously 6
    const extraBlockPadding = 5; // used in ensurePage calculation (previously 10)

    for (let idx = 0; idx < items.length; idx++) {
      const li = items[idx];
      const nestedLists = Array.from(li.children).filter((c) =>
        ["ul", "ol"].includes(c.tagName.toLowerCase())
      );
      const working = li.cloneNode(true) as HTMLElement;
      working.querySelectorAll("ul,ol").forEach((n) => n.remove());

      // Tokenize immediate inline contents (bold vs normal)
      const tokens: { text: string; bold: boolean }[] = [];
      working.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          const t = node.textContent || "";
          if (t.trim()) tokens.push({ text: t, bold: false });
        } else if (node.nodeType === 1) {
          const tag = (node as Element).tagName.toLowerCase();
          const t = (node as Element).textContent || "";
          if (["strong", "b"].includes(tag)) {
            if (t.trim()) tokens.push({ text: t, bold: true });
          } else {
            if (t.trim()) tokens.push({ text: t, bold: false });
          }
        }
      });
      if (!tokens.length) return;

      // reduce gap between left margin and text slightly (keeps indent logic but will render closer to bullet)
      const textLeft = leftMargin + baseIndent + level * 4;
      const availableWidth = contentWidth - (textLeft - leftMargin) - 4;

      // ensure we measure spaces with the selected font-size
      doc.setFont("Roboto", "normal");
      const spaceWidthNormal = doc.getTextWidth(" ");

      interface LineSeg {
        text: string;
        bold: boolean;
      }
      const lines: LineSeg[][] = [];
      let current: LineSeg[] = [];
      let currentWidth = 0;

      const flush = () => {
        if (current.length) {
          lines.push(current);
          current = [];
          currentWidth = 0;
        }
      };
      const addWord = (word: string, bold: boolean) => {
        doc.setFont("Roboto", bold ? "bold" : "normal");
        const w = doc.getTextWidth(word);
        const extra = currentWidth === 0 ? 0 : spaceWidthNormal;
        if (currentWidth + extra + w > availableWidth) {
          flush();
          current.push({ text: word, bold });
          currentWidth = w;
        } else {
          if (currentWidth !== 0) {
            current.push({ text: " ", bold: false });
            currentWidth += spaceWidthNormal;
          }
          current.push({ text: word, bold });
          currentWidth += w;
        }
      };

      tokens.forEach((tok) => {
        tok.text
          .replace(/\s+/g, " ")
          .split(" ")
          .forEach((w) => {
            if (w) addWord(w, tok.bold);
          });
      });
      flush();

      // Page height check total (adjusted for smaller lineHeight)
      ensurePage(lines.length * lineHeight + extraBlockPadding);

      // reduce bullet-to-text gap: bullet is placed nearer to textLeft
      const bulletX = textLeft - 3; // now closer
      const firstLineY = y;

      const fontSize = doc.getFontSize(); // 10
      const bulletSize = 0.8; // smaller uniform bullet
      const bulletYOffset = fontSize * 0.1; // vertical centering adjustment
      const centerY = firstLineY - bulletYOffset;

      if (ordered) {
        doc.setFont("Roboto", "normal");
        doc.text(`${idx + 1}.`, bulletX, firstLineY);
      } else {
        doc.setFillColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);

        if (level === 0) {
          // filled circle
          doc.circle(bulletX - 1, centerY, bulletSize, "F");
        } else if (level === 1) {
          // hollow circle
          doc.circle(bulletX - 1, centerY, bulletSize);
        } else {
          // filled square — center aligned to same vertical position
          const sqHalf = bulletSize;
          const sqTopY = centerY - sqHalf;
          const sqLeftX = bulletX - sqHalf - 0.2; // slight horizontal offset for optical alignment
          doc.rect(sqLeftX, sqTopY, sqHalf * 2, sqHalf * 2, "F");
        }
      }

      // render lines with the configured font-size (10)
      lines.forEach((segs, lineIdx) => {
        const lineY = firstLineY + lineIdx * lineHeight;
        let cx = textLeft;
        segs.forEach((seg) => {
          doc.setFont("Roboto", seg.bold ? "bold" : "normal");
          doc.text(seg.text, cx, lineY);
          cx += doc.getTextWidth(seg.text);
        });
      });

      // advance y by the reduced lineHeight
      y += lines.length * lineHeight + 2;
      for (const nl of nestedLists) {
        await drawList(nl, nl.tagName.toLowerCase() === "ol", level + 1);
      }
    }

    y += 2;
  };

  const drawBlockquote = (el: Element) => {
    const text = (el.textContent || "").trim();
    if (!text) return;
    doc.setFont("Roboto", "italic");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text, contentWidth - 8);
    const height = lines.length * 6 + 6;
    ensurePage(height + 4);
    // left border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(2);
    doc.line(leftMargin, y, leftMargin, y + height - 4);
    doc.setTextColor(100, 116, 139);
    lines.forEach((ln: string, idx: number) => {
      doc.text(ln, leftMargin + 6, y + 6 + idx * 6 - 2);
    });
    doc.setTextColor(0, 0, 0);
    y += height;
  };

  const drawCodeBlock = (el: Element) => {
    const text = (el.textContent || "").replace(/\n{2,}/g, "\n").trim();
    if (!text) return;
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(text, contentWidth - 6);
    const blockHeight = lines.length * 6 + 8;
    ensurePage(blockHeight + 4);
    // background rectangle (light gray)
    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, y, contentWidth, blockHeight, "F");
    doc.setTextColor(0, 0, 0);
    lines.forEach((ln: string, idx: number) => {
      doc.text(ln, leftMargin + 3, y + 6 + idx * 6);
    });
    y += blockHeight + 3;
    doc.setFont("Roboto", "normal");
  };

  const drawInlineCode = (code: string) => {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11);
    const width = doc.getTextWidth(code) + 4;
    ensurePage(8);
    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, y - 5, width, 8, "F");
    doc.setTextColor(0, 0, 0);
    doc.text(code, leftMargin + 2, y);
    y += 8;
    doc.setFont("Roboto", "normal");
  };

  const drawTable = (table: Element) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return;

    doc.setFont("Roboto", "normal");
    const fontSize = 10;
    doc.setFontSize(fontSize);

    // Extract cell texts
    const matrix = rows.map((r) =>
      Array.from(r.children).map((c) => (c.textContent || "").trim())
    );
    const colCount = Math.max(...matrix.map((r) => r.length));
    if (colCount === 0) return;

    // Configuration for table splitting
    const maxColumnsPerTable = 5; // Maximum columns per split table
    const shouldSplitTable = colCount > maxColumnsPerTable;

    if (!shouldSplitTable) {
      // Draw normal table if columns <= maxColumnsPerTable
      drawSingleTable(matrix, colCount);
    } else {
      // Split table into multiple tables
      drawSplitTables(matrix, colCount, maxColumnsPerTable);
    }
  };

  // Helper function to draw a single table
  const drawSingleTable = (matrix: string[][], colCount: number) => {
    const paddingPerCell = 2;
    const minColRawWidth = 20;
    const rawWidths = Array(colCount)
      .fill(0)
      .map((_, cIdx) => {
        let longest = 0;
        for (let r = 0; r < matrix.length; r++) {
          const txt = matrix[r][cIdx] || "";
          const w = doc.getTextWidth(txt);
          if (w > longest) longest = w;
        }
        return Math.max(minColRawWidth, longest + paddingPerCell);
      });

    const rawTotal = rawWidths.reduce((s, v) => s + v, 0);
    const scale = rawTotal > 0 ? contentWidth / rawTotal : 1;
    const colWidths = rawWidths.map((w) => w * scale);

    drawTableWithData(matrix, colCount, colWidths);
  };

  // Helper function to draw split tables
  const drawSplitTables = (
    matrix: string[][],
    colCount: number,
    maxCols: number
  ) => {
    const headerRow = matrix.length > 0 ? matrix[0] : [];

    // Calculate how many splits we need (excluding the first column which is always included)
    const remainingCols = colCount - 1; // Exclude first column
    const numSplits = Math.ceil(remainingCols / (maxCols - 1)); // -1 because first column is repeated

    for (let splitIndex = 0; splitIndex < numSplits; splitIndex++) {
      // Add spacing between split tables (except for the first one)
      if (splitIndex > 0) {
        y += 5;
        ensurePage(20);

        // Add a subtitle for the continuation
        doc.setFont("Roboto", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Table continuation (${splitIndex + 1}/${numSplits})`,
          leftMargin,
          y
        );
        y += 3;
        doc.setFont("Roboto", "normal");
        doc.setTextColor(0, 0, 0);
      }

      // Determine column range for this split
      const startCol = splitIndex === 0 ? 0 : 1 + splitIndex * (maxCols - 1);
      const endCol = Math.min(
        startCol + maxCols - (splitIndex > 0 ? 1 : 0),
        colCount
      );

      // Create column indices for this split (always include column 0 after first split)
      const columnIndices =
        splitIndex === 0
          ? Array.from({ length: endCol }, (_, i) => i)
          : [
              0,
              ...Array.from(
                { length: endCol - startCol },
                (_, i) => startCol + i
              ),
            ];

      // Extract data for this split
      const splitMatrix = matrix.map((row) =>
        columnIndices.map((colIdx) => row[colIdx] || "")
      );

      const splitColCount = columnIndices.length;

      // Calculate column widths for this split
      const paddingPerCell = 2;
      const minColRawWidth = 20;
      const rawWidths = Array(splitColCount)
        .fill(0)
        .map((_, cIdx) => {
          let longest = 0;
          for (let r = 0; r < splitMatrix.length; r++) {
            const txt = splitMatrix[r][cIdx] || "";
            const w = doc.getTextWidth(txt);
            if (w > longest) longest = w;
          }
          return Math.max(minColRawWidth, longest + paddingPerCell);
        });

      const rawTotal = rawWidths.reduce((s, v) => s + v, 0);
      const scale = rawTotal > 0 ? contentWidth / rawTotal : 1;
      const colWidths = rawWidths.map((w) => w * scale);

      // Draw this split table
      drawTableWithData(splitMatrix, splitColCount, colWidths);
    }
  };

  // Core table drawing function
  const drawTableWithData = (
    matrix: string[][],
    colCount: number,
    colWidths: number[]
  ) => {
    const startX = leftMargin;
    let currentY = y;

    // Header drawer with border color
    const drawHeaderRow = (headerRow: string[], yPos: number) => {
      const headerLines = Array.from({ length: colCount }).map((_, cIdx) => {
        const txt = headerRow[cIdx] || "";
        const usable = Math.max(1, colWidths[cIdx] - 4);
        return doc.splitTextToSize(txt, usable);
      });

      const maxHeaderLines = Math.max(...headerLines.map((l) => l.length));
      const lineHeight = 5;
      const headerRowHeight = maxHeaderLines * lineHeight + 6;

      let cellX = startX;
      headerLines.forEach((lines, cIdx) => {
        // Header style
        doc.setFillColor(243, 244, 246); // #f3f4f6
        doc.setTextColor(100, 116, 139); // #64748b
        doc.setDrawColor(201, 201, 201); // border color #c9c9c9

        // Draw header cell background + border
        doc.rect(cellX, yPos, colWidths[cIdx], headerRowHeight, "FD");

        // Draw header text
        const textStartX = cellX + 2;
        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          const ln = lines[lIdx];
          doc.text(ln, textStartX, yPos + 6 + lIdx * lineHeight);
        }
        cellX += colWidths[cIdx];
      });

      return headerRowHeight;
    };

    const headerRow = matrix.length > 0 ? matrix[0] : [];

    matrix.forEach((row, rIdx) => {
      const cellLines = Array.from({ length: colCount }).map((_, cIdx) => {
        const txt = row[cIdx] || "";
        const usable = Math.max(1, colWidths[cIdx] - 4);
        return doc.splitTextToSize(txt, usable);
      });

      const maxLines = Math.max(...cellLines.map((l) => l.length));
      const lineHeight = 5;
      const rowHeight = maxLines * lineHeight + 6;

      const needsPageBreak = currentY + rowHeight > bottomMargin;
      if (needsPageBreak && rIdx > 0) {
        doc.addPage();
        currentY = 20;
        const headerHeight = drawHeaderRow(headerRow, currentY);
        currentY += headerHeight;
      } else {
        ensurePage(rowHeight + 4);
      }

      let cellX = startX;
      cellLines.forEach((lines, cIdx) => {
        // Set border color
        doc.setDrawColor(201, 201, 201);

        if (rIdx === 0) {
          // Header
          doc.setFillColor(243, 244, 246); // #f3f4f6
          doc.setTextColor(100, 116, 139); // #64748b
          doc.rect(cellX, currentY, colWidths[cIdx], rowHeight, "FD");
        } else {
          // Body rows
          doc.setFillColor(255, 255, 255);
          doc.setTextColor(0, 0, 0);
          doc.rect(cellX, currentY, colWidths[cIdx], rowHeight, "FD");
        }

        const textStartX = cellX + 2;
        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          const ln = lines[lIdx];
          doc.text(ln, textStartX, currentY + 6 + lIdx * lineHeight);
        }
        cellX += colWidths[cIdx];
      });

      currentY += rowHeight;
    });

    y = currentY + 10;
  };

  const drawSVG = async (svg: SVGElement) => {
    try {
      // Get SVG dimensions with proper handling of percentage values and viewBox
      const svgSVGElement = svg as SVGSVGElement;
      let svgWidth = 400; // Default fallback
      let svgHeight = 320; // Default fallback

      // Try to get dimensions from viewBox first (more reliable)
      const viewBox = svg.getAttribute("viewBox");
      if (viewBox) {
        const viewBoxValues = viewBox.split(/\s+/);
        if (viewBoxValues.length === 4) {
          svgWidth = parseFloat(viewBoxValues[2]) || svgWidth;
          svgHeight = parseFloat(viewBoxValues[3]) || svgHeight;
        }
      }

      // If no viewBox, try other methods (avoiding percentage-based width/height)
      if (!viewBox) {
        try {
          // Only use baseVal if it's not a percentage
          const widthAttr = svg.getAttribute("width");
          const heightAttr = svg.getAttribute("height");

          if (widthAttr && !widthAttr.includes("%")) {
            const parsedWidth = parseInt(widthAttr);
            if (!isNaN(parsedWidth)) svgWidth = parsedWidth;
          }

          if (heightAttr && !heightAttr.includes("%")) {
            const parsedHeight = parseInt(heightAttr);
            if (!isNaN(parsedHeight)) svgHeight = parsedHeight;
          }

          // Try client dimensions as last resort
          if (svgWidth === 400 && svg.clientWidth > 0)
            svgWidth = svg.clientWidth;
          if (svgHeight === 320 && svg.clientHeight > 0)
            svgHeight = svg.clientHeight;
        } catch (dimensionError) {
          console.warn(
            "Error reading SVG dimensions, using defaults:",
            dimensionError
          );
          // Keep default values
        }
      }

      // Calculate scaled dimensions to fit within content width
      const maxWidth = contentWidth;
      const scaleFactor = Math.min(1, maxWidth / svgWidth);
      const scaledWidth = svgWidth * scaleFactor;
      const scaledHeight = svgHeight * scaleFactor;

      // Ensure we have space for the SVG
      ensurePage(scaledHeight + 15);

      // Method 1: Try to convert SVG to canvas using html2canvas
      try {
        const html2canvas = (await import("html2canvas")).default;

        // Create a temporary container for the SVG
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        tempContainer.style.width = `${svgWidth}px`;
        tempContainer.style.height = `${svgHeight}px`;
        tempContainer.appendChild(svg.cloneNode(true));
        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, {
          backgroundColor: "transparent",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: svgWidth,
          height: svgHeight,
        });

        // Clean up temporary container
        document.body.removeChild(tempContainer);

        if (canvas.width > 0 && canvas.height > 0) {
          const imgData = canvas.toDataURL("image/png", 0.9);
          doc.addImage(
            imgData,
            "PNG",
            leftMargin,
            y,
            scaledWidth,
            scaledHeight
          );
          y += scaledHeight + 15;
          console.log(
            `SVG captured via html2canvas: ${scaledWidth}x${scaledHeight}`
          );
          return;
        }
      } catch (canvasError) {
        console.warn("html2canvas SVG capture failed:", canvasError);
      }

      // Method 2: Try to convert SVG to data URL directly
      try {
        // Clone the SVG and ensure it has absolute dimensions for conversion
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute("width", svgWidth.toString());
        svgClone.setAttribute("height", svgHeight.toString());

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create an image element to convert SVG to canvas
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = svgWidth;
          canvas.height = svgHeight;

          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
              const imgData = canvas.toDataURL("image/png", 0.9);
              doc.addImage(
                imgData,
                "PNG",
                leftMargin,
                y,
                scaledWidth,
                scaledHeight
              );
              y += scaledHeight + 15;
              console.log(
                `SVG captured via direct conversion: ${scaledWidth}x${scaledHeight}`
              );
              URL.revokeObjectURL(svgUrl);
              resolve(void 0);
            };
            img.onerror = reject;
            img.src = svgUrl;
          });
          return;
        }
      } catch (directError) {
        console.warn("Direct SVG conversion failed:", directError);
      }

      // Method 3: Fallback - try to add SVG as base64 encoded image
      try {
        // Clone the SVG and ensure it has absolute dimensions
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute("width", svgWidth.toString());
        svgClone.setAttribute("height", svgHeight.toString());

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const encodedSvg =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgString)));
        doc.addImage(
          encodedSvg,
          "SVG",
          leftMargin,
          y,
          scaledWidth,
          scaledHeight
        );
        y += scaledHeight + 15;
        console.log(`SVG added as base64: ${scaledWidth}x${scaledHeight}`);
        return;
      } catch (base64Error) {
        console.warn("Base64 SVG encoding failed:", base64Error);
      }

      // Final fallback: Add placeholder text
      doc.setFont("Roboto", "italic");
      doc.setFontSize(12);
      doc.setTextColor(128, 128, 128);
      const placeholderText = `📊 SVG Graphic (${Math.round(
        scaledWidth
      )}×${Math.round(scaledHeight)})`;
      doc.text(placeholderText, leftMargin, y);
      y += 20;
      doc.setTextColor(0, 0, 0);
      console.log("SVG rendered as placeholder text");
    } catch (error) {
      console.error("Error processing SVG:", error);
      // Add error message to PDF
      doc.setFont("Roboto", "normal");
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      const errorText = `❌ SVG rendering error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      const splitError = doc.splitTextToSize(errorText, contentWidth);
      splitError.forEach((line: string) => {
        ensurePage(12);
        doc.text(line, leftMargin, y);
        y += 12;
      });
      doc.setTextColor(0, 0, 0);
    }
  };

  const traverse = async (el: Element) => {
    const tag = el.tagName.toLowerCase();
    switch (tag) {
      case "h1":
        drawHeading(el.textContent || "", 1);
        break;
      case "h2":
        drawHeading(el.textContent || "", 2);
        break;
      case "h3":
        drawHeading(el.textContent || "", 3);
        break;
      case "h4":
        drawHeading(el.textContent || "", 4);
        break;
      case "p":
        drawParagraph(el);
        break;
      case "ul":
        await drawList(el, false, 0);
        break;
      case "ol":
        await drawList(el, true, 0);
        break;
      case "blockquote":
        drawBlockquote(el);
        break;
      case "pre":
        drawCodeBlock(el);
        break;
      case "code":
        // if inside pre, let pre handle
        if (
          el.parentElement &&
          el.parentElement.tagName.toLowerCase() === "pre"
        )
          break;
        drawInlineCode(el.textContent || "");
        break;
      case "table":
        drawTable(el);
        break;
      case "svg":
        await drawSVG(el as SVGElement);
        break;
      default:
        // For inline / unknown containers, descend
        for (const child of Array.from(el.children)) {
          await traverse(child);
        }
    }
  };

  for (const child of Array.from(temp.children)) {
    await traverse(child);
  }

  // fallback plain text if nothing processed
  if (!temp.children.length && temp.textContent) {
    drawParagraph(temp.textContent);
  }
  return y;
};

// Helper functions for PDF generation (outside renderHtmlContentToPDF)
const createPDFHelpers = (doc: any) => {
  return {
    setFont: (
      style: "normal" | "bold" | "italic" = "normal",
      size?: number
    ) => {
      doc.setFont("Roboto", style);
      if (size) doc.setFontSize(size);
    },

    setColors: (
      textColor: [number, number, number],
      fillColor?: [number, number, number]
    ) => {
      doc.setTextColor(...textColor);
      if (fillColor) doc.setFillColor(...fillColor);
    },

    drawLabeledText: (
      label: string,
      text: string,
      x: number,
      y: number,
      maxWidth: number = 150
    ) => {
      // Draw label in bold blue
      doc.setFontSize(13);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(223, 89, 0); //#DF5900
      doc.text(`${label}:`, x, y);

      // Calculate label width for proper alignment
      const labelWidth = doc.getTextWidth(`${label}: `) + 2;

      // Draw text in normal black
      doc.setFont("Roboto", "normal");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, x + labelWidth, y);

      return y + splitText.length * 7;
    },

    addPDFHeader: (title: string = "Snowkap AI: Chat Response") => {
      // Logo and company info section
      const logoY = 15;

      // Add Snowkap logo image
      try {
        // Load the logo image from public folder
        const logoImg = new Image();
        logoImg.src = "/images/logo.png";
        doc.addImage(logoImg, "PNG", 10, logoY - 2, 48, 8); // x, y, width, height
      } catch (error) {
        console.warn("Logo image not found, using fallback");
        // Fallback to text if image fails to load
        doc.setFillColor(223, 89, 0);
        doc.circle(20, logoY, 8, "F");
      }

      // Add tagline next to logo
      doc.setFontSize(12);
      doc.setFont("Roboto", "italic");
      doc.setTextColor(100, 100, 100); // Medium gray
      doc.text("Turn Climate Complexity Into Business Clarity", 63, logoY + 6);

      // Main heading - centered below logo section
      const headingY = logoY + 20;
      doc.setFontSize(18);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(0, 59, 82); //#003B52
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getTextWidth(title);
      const x = pageWidth / 2;

      doc.text(title, x, headingY, { align: "center" });
      doc.line(
        x - textWidth / 2,
        headingY + 2,
        x + textWidth / 2,
        headingY + 2
      );

      return 50; // Return y position for next content (adjusted for larger header)
    },

    addSourcesSection: (sources: any[], startY: number) => {
      let yPosition = startY;

      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      // Sources header - enhanced to detect AI service sources vs legacy sources
      doc.setFontSize(13);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(223, 89, 0); //#DF5900

      // Check if we have AI service sources (with file_name property)
      const hasAIServiceSources = sources.length > 0 && sources[0].file_name;
      const headerText = hasAIServiceSources
        ? "Source References:"
        : "Sources:";

      doc.text(headerText, 10, yPosition);
      yPosition += 10;

      // Reset font for source items
      doc.setFont("Roboto", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      sources.forEach((source, i) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }

        // Handle different source data structures - AIResponse vs legacy formats
        let fileName = `Source ${i + 1}`;
        let fileUrl = null;
        let pageNumber = null;

        // Check for AIServiceSource structure (from AIResponse)
        if (source.file_name) {
          fileName = source.file_name;
          fileUrl = source.file_url;
          pageNumber = source.page_number;
        }
        // Check for legacy structure (from other exports)
        else if (
          source.source?.company_name ||
          source.source?.metadata?.company
        ) {
          fileName =
            source.source?.company_name ||
            source.source?.metadata?.company ||
            `Source ${i + 1}`;
          fileUrl = source.source?.s3_url;
        }

        doc.setFont("Roboto", "bold");
        doc.setTextColor(0, 0, 0);

        // Create display text with page number if available
        const displayText = pageNumber
          ? `${fileName} (Page ${pageNumber})`
          : fileName;

        doc.text(displayText, 10, yPosition);

        // Add underline and clickable link
        const textWidth = doc.getTextWidth(displayText);
        doc.line(10, yPosition + 1, 10 + textWidth, yPosition + 1);
        if (fileUrl) {
          // Add clickable links with page navigation for PDFs
          const finalUrl =
            fileUrl.toLowerCase().includes(".pdf") && pageNumber
              ? `${fileUrl}#page=${pageNumber}`
              : fileUrl;

          doc.link(20, yPosition - 6, textWidth, 8, {
            url: finalUrl,
            NewWindow: true,
          });
        }

        yPosition += 8;
      });

      return yPosition;
    },

    addTimestamp: () => {
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 290);
    },

    savePDF: (queryId?: string | number) => {
      const id = queryId || Date.now();
      doc.save(`Snowkap_ESG_Analysis-Query_${id}.pdf`);
    },

    addAISourcesSection: (sources: any[], startY: number) => {
      let yPosition = startY;

      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      // AI-specific sources with document type labels and clickable links
      doc.setFontSize(13);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(223, 89, 0); //#DF5900
      doc.text("Source References:", 10, yPosition);
      yPosition += 10;

      // Reset font for source items
      doc.setFont("Roboto", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      sources.forEach((source, i) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }

        // Get document type label
        const getDocTypeLabel = (docType: string) => {
          switch (docType) {
            case "esg_documents":
              return "[ ESG Report ]";
            case "brsr_documents":
              return "[ BRSR Report ]";
            case "document_repo":
              return "[ Document Repository ]";
            default:
              return "[ Document Repository ]";
          }
        };

        const docTypeLabel = source.document_type
          ? getDocTypeLabel(source.document_type)
          : "";
        const fileName = source.file_name || `Source ${i + 1}`;
        const pageInfo = source.page_number
          ? ` (Page ${source.page_number})`
          : "";

        // Create display text
        const displayText = `${docTypeLabel} ${fileName}${pageInfo}`;

        doc.setFont("Roboto", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(displayText, 10, yPosition);

        // Add underline and clickable link
        const textWidth = doc.getTextWidth(displayText);
        doc.line(10, yPosition + 1, 10 + textWidth, yPosition + 1);
        if (source.file_url) {
          // Create clickable PDF links with direct page navigation
          const finalUrl =
            source.file_url.toLowerCase().includes(".pdf") && source.page_number
              ? `${source.file_url}#page=${source.page_number}`
              : source.file_url;

          doc.link(20, yPosition - 6, textWidth, 8, {
            url: finalUrl,
          });
        }

        yPosition += 10;
      });

      return yPosition;
    },
  };
};

/**
 * Downloads a file from a URL using server-side proxy to bypass CORS
 * @param url - The S3 URL or file URL to download
 * @param filename - The desired filename for the download
 */
export const downloadFile = async (
  url: string,
  filename: string
): Promise<void> => {
  try {
    // Use server-side proxy to bypass CORS restrictions
    const proxyUrl = `/api/user/download?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(filename)}`;

    const response = await fetch(proxyUrl);

    if (response.ok) {
      // Get the blob data from proxy
      const blob = await response.blob();

      // Create object URL and trigger download
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } else {
      console.error("Download failed:", response.status, response.statusText);
      // Fallback: open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export const handleExportJSON = (results: any, query: string) => {
  if (!results) return;
  const exportData = {
    query: query,
    query_type: results.query_type,
    timestamp: new Date().toISOString(),
    confidence: results.confidence,
    processing_time_ms: results.processing_time_ms,
    answer: results.answer,
    sources: results.sources,
    metadata: results.metadata,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Snowkap_ESG_Analysis-Query_${results.metadata.query_id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleExportPDF = async (results: any, query: string) => {
  return handleExportPDFWithContainer(results, query, ".esg-graphical-output");
};

export const handleExportPDFFromModal = async (results: any, query: string) => {
  // Wait a bit longer for modal charts to render completely
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return handleExportPDFWithContainer(results, query, ".aiChatResponseContent");
};

export const handleExportPDFFromProfile = async (
  results: any,
  query: string
) => {
  // For profile page exports, we handle both textual and graphical content differently
  if (!results) return;

  try {
    // Import required libraries dynamically
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const doc = new jsPDF();
    await ensureRoboto(doc);
    const helpers = createPDFHelpers(doc);

    // Set up the PDF header and add labeled content
    let yPosition = helpers.addPDFHeader();
    yPosition = helpers.drawLabeledText("User Query", query, 10, yPosition) + 1;
    yPosition =
      helpers.drawLabeledText(
        "Expected Response Format",
        results.query_type,
        10,
        yPosition
      ) + 1;

    // Add Response header
    helpers.setFont("bold", 13);
    helpers.setColors([223, 89, 0]);
    doc.text("Response:", 10, yPosition + 1);
    helpers.setFont("normal", 13);
    helpers.setColors([0, 0, 0]);
    yPosition += 5;

    // Textual content block
    if (
      results.query_type !== "Graphical" ||
      !results.answer.includes("<canvas")
    ) {
      try {
        yPosition = await renderHtmlContentToPDF(
          doc,
          results.answer,
          yPosition
        );
      } catch (innerErr) {
        console.error(
          "Native render failed, falling back to plain text",
          innerErr
        );
        const fallback = results.answer.replace(/<[^>]*>/g, "").trim();
        const lines = doc.splitTextToSize(fallback, 170);
        lines.forEach((ln: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(ln, 20, yPosition);
          yPosition += 6;
        });
      }
    }

    // Add metadata
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // Optional spacing before sources
    yPosition += 12;

    // Add sources (supports results.sources or results.metadata.sources)
    const profileSources = Array.isArray((results as any).sources)
      ? (results as any).sources
      : Array.isArray((results as any).metadata?.sources)
      ? (results as any).metadata.sources
      : [];

    if (profileSources.length > 0) {
      const hasAIServiceSources =
        profileSources[0] && profileSources[0].file_name;
      if (hasAIServiceSources) {
        yPosition = helpers.addAISourcesSection(profileSources, yPosition);
      } else {
        yPosition = helpers.addSourcesSection(profileSources, yPosition);
      }
    }

    helpers.addTimestamp();
    helpers.savePDF(results.query_id);
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
};

export const handleExportPDFWithContainer = async (
  results: any,
  query: string,
  containerSelector: string
) => {
  if (!results) return;
  try {
    // Import required libraries dynamically
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const doc = new jsPDF();
    await ensureRoboto(doc);
    const helpers = createPDFHelpers(doc);

    // Set up the PDF header and add labeled content
    let yPosition = helpers.addPDFHeader();
    yPosition = helpers.drawLabeledText("User Query", query, 10, yPosition) + 1;
    yPosition =
      helpers.drawLabeledText(
        "Expected Response Format",
        results.query_type,
        10,
        yPosition
      ) + 1;

    // Add Response header
    helpers.setFont("bold", 13);
    helpers.setColors([223, 89, 0]);
    doc.text("Response:", 10, yPosition + 1);
    helpers.setFont("normal", 13);
    helpers.setColors([0, 0, 0]);
    yPosition += 5;

    // Handle graphical vs textual content
    if (results.query_type === "Graphical" && results.answer.includes("<")) {
      // Method 1: Try to capture individual canvas elements first
      yPosition = await renderHtmlContentToPDF(doc, results.answer, yPosition);
    } else {
      // Textual content: native parser (no canvas)
      yPosition = await renderHtmlContentToPDF(doc, results.answer, yPosition);
    }

    // Add spacing before sources section
    yPosition += 12;

    // Auto-detect and use appropriate source rendering based on data structure
    if (results.sources && results.sources.length > 0) {
      const hasAIServiceSources =
        results.sources[0] && results.sources[0].file_name;
      if (hasAIServiceSources) {
        yPosition = helpers.addAISourcesSection(results.sources, yPosition);
      } else {
        yPosition = helpers.addSourcesSection(results.sources, yPosition);
      }
    }

    helpers.addTimestamp();
    helpers.savePDF(results.metadata?.query_id);
  } catch (error) {
    console.error("❌ PDF Export Failed:", error);
    alert(`Error generating PDF: ${error}. Check console for details.`);
  }
};

// Minimal Next.js page component to satisfy pages/ default export requirement.
// This file primarily exposes helper functions for PDF export.
const ExportPdfJsonPage: React.FC = () => null;
export default ExportPdfJsonPage;
