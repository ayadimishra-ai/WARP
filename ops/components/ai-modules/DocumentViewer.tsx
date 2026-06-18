"use client";
import { Button, Flex, Image, Paper, Text } from "@mantine/core";
import { IconMinusVertical, IconPlus, IconReload } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { TIFFViewer } from "react-tiff";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";

// Dynamically import PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => (
    <Text ta="center" w="100%" m="auto 0">
      Loading PDF Viewer...
    </Text>
  ),
});

interface DocumentViewerProps {
  fileURL: string;
}

type FileType = "pdf" | "image" | "tiff" | "unsupported" | "none";

const getFileType = (url: string): FileType => {
  if (!url) return "none";
  const lowerURL = url.toLowerCase();
  if (lowerURL.endsWith(".pdf")) return "pdf";
  if ([".png", ".jpg", ".jpeg"].some((ext) => lowerURL.endsWith(ext)))
    return "image";
  if ([".tif", ".tiff"].some((ext) => lowerURL.endsWith(ext))) return "tiff";
  return "unsupported";
};

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const controls = useMemo(
    () => [
      {
        icon: <IconPlus size="14px" stroke={3} />,
        onClick: zoomIn,
        label: "Zoom In",
      },
      {
        icon: <IconReload size="16px" stroke={3} />,
        onClick: resetTransform,
        label: "Reset",
      },
      {
        icon: <IconMinusVertical size="14px" stroke={3} />,
        onClick: zoomOut,
        label: "Zoom Out",
      },
    ],
    [zoomIn, zoomOut, resetTransform]
  );
  return (
    <Paper
      pos="absolute"
      bg="transparent"
      top={75}
      left={35}
      styles={{
        root: {
          zIndex: 2,
          transformOrigin: "left bottom",
          transform: "rotate(270deg)",
          opacity: 0.8,
        },
      }}
    >
      <Flex gap="4px">
        {controls.map(({ icon, onClick, label }) => (
          <Button
            key={label}
            color="#003b52"
            w="30px"
            h="30px"
            p="0px"
            radius="md"
            onClick={() => onClick()}
            aria-label={label}
          >
            {icon}
          </Button>
        ))}
      </Flex>
    </Paper>
  );
};

const DocumentViewer = ({ fileURL }: DocumentViewerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>("none");

  useEffect(() => {
    if (!fileURL) {
      setError("File URL not provided");
      setFileType("none");
      return;
    }
    const type = getFileType(fileURL);
    setFileType(type);
    setError(type === "unsupported" ? "Unsupported file format" : null);
  }, [fileURL]);

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Text c="red">{error}</Text>
      </Paper>
    );
  }

  if (["pdf", "image", "tiff"].includes(fileType)) {
    return (
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={3}
        wheel={{ step: 0.1 }}
      >
        <Paper
          pos="relative"
          p={5}
          radius={10}
          withBorder
          styles={{
            root: {
              border: "1px solid #ccc",
            },
          }}
        >
          <Controls />
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "715px",
              overflow: "auto",
            }}
            contentStyle={{
              display: "block",
              cursor: "grab",
            }}
          >
            {fileType === "pdf" && <PDFViewer pdfUrl={fileURL} />}
            {fileType === "tiff" && <TIFFViewer tiff={fileURL} />}
            {fileType === "image" && <Image src={fileURL} alt="document" />}
          </TransformComponent>
        </Paper>
      </TransformWrapper>
    );
  }

  return (
    <Paper
      p={5}
      radius={10}
      withBorder
      styles={{
        root: {
          border: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
        },
      }}
    >
      <Text ta="center">Loading document...</Text>
    </Paper>
  );
};

export default DocumentViewer;
