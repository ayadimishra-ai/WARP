import { Text } from "@mantine/core";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
  initialValue?: string;
  formField?: any;
  onContentChange: (content: string, plainText: string) => void;
  validationMessage: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  initialValue = "",
  formField,
  onContentChange,
  validationMessage = "",
}) => {
  const [editorContent, setEditorContent] = useState<string>(initialValue);
  const [textLength, setTextLength] = useState(0);
  const maxLength = formField?.interfaceOptions?.maxLength;

  const getPlainText = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || "";
  };

  const debouncedContentChange = useCallback(
    debounce(
      (value: string, plainText: string) => onContentChange(value, plainText),
      100
    ),
    []
  );

  const handleEditorChange = (
    value: string,
    delta: any,
    source: string,
    editors: any
  ) => {
    console.log("QuillEditors", delta);
    const plainText = getPlainText(value).trim();
    setTextLength(plainText.length);
    if (maxLength >= 0) {
      if (plainText.length <= maxLength) {
        setEditorContent(value);
        debouncedContentChange(value, plainText);
      }
    } else {
      setEditorContent(value);
      debouncedContentChange(value, plainText);
    }
  };

  return (
    <div className="QuillEditors">
      <ReactQuill
        value={editorContent}
        onChange={handleEditorChange}
        //onBlur={handleEditorChange}
        placeholder={formField?.placeholder}
        theme="snow"
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["bold", "italic", "underline"],
          ],
        }}
        formats={["header", "list", "bullet", "bold", "italic", "underline"]}
      />
      <Text c="red" size={"sm"}>
        {validationMessage}
      </Text>
    </div>
  );
};

export default QuillEditor;
