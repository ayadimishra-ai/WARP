"use client";

import { Box, Text } from "@mantine/core";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdfUrl) return;

    let isMounted = true;
    const container = containerRef.current;

    const renderAllPages = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        setNumPages(pdf.numPages);

        if (!container) return;

        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.style.width = "100%";
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext("2d");
          if (!context) continue;

          await page.render({ canvasContext: context, viewport, canvas })
            .promise;

          container.appendChild(canvas);
        }
      } catch (err) {
        if (isMounted) {
          console.error("PDF rendering error:", err);
          setError("Failed to render PDF.");
        }
      }
    };

    renderAllPages();

    // Cleanup function
    return () => {
      isMounted = false;
      if (container) {
        container.innerHTML = "";
      }
    }
  }, [pdfUrl]);

  if (error) {
    return (
      <Text c="red" ta="center">
        {error}
      </Text>
    );
  }

  return <Box ref={containerRef}></Box>;
};

export default PDFViewer;
