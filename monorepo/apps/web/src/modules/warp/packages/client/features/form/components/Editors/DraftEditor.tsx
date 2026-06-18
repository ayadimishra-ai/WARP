import { warpContentSize } from "@/modules/warp/packages/client/services/platform-window-message.service";
import {
  ContentState,
  DraftInlineStyleType,
  Editor,
  EditorState,
  RichUtils,
  convertFromHTML,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { BiParagraph } from "react-icons/bi";
import {
  FaBold,
  FaHeading,
  FaItalic,
  FaListOl,
  FaListUl,
  FaUnderline,
} from "react-icons/fa";
import { useDisabledField } from "../../hooks/useDisabledField";
import { useEnableQuestionField } from "../../hooks/useEnableQuestionField";

interface EditorProps {
  initialValue?: string;
  formField?: any;
  onContentChange?: (
    fieldId: string,
    content: string,
    plainText: string,
    isFromAI?: boolean,
    oldContent?: string
  ) => void;
  validationMessage?: string;
  isFromAI?: boolean;
  maxLength?: number;
}

const DraftEditor: React.FC<EditorProps> = ({
  initialValue = "",
  formField,
  onContentChange = () => {},
  validationMessage = "",
  isFromAI,
  maxLength,
}) => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const editorRef = useRef<Editor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contentStateValue, setContentStateValue] = useState<string>("");
  
  // Disabled state hook
  const EnableQuestionField = formField ? useEnableQuestionField(formField) : true;
  const isDisabled = formField?.questionId 
    ? useDisabledField(formField.questionId, EnableQuestionField)
    : false;
  
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  useEffect(() => {
    if (!isInitialized) {
      if (initialValue) {
        const { contentBlocks, entityMap } = convertFromHTML(initialValue);
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setEditorState(EditorState.createWithContent(contentState));
      }
      setIsInitialized(true);

      const resizeObserver = new ResizeObserver((e) => {
        postParentMessage(warpContentSize(e[0].contentRect.height));
      });
      resizeObserver.observe(document.body);
      return () => {
        resizeObserver.unobserve(document.body);
      };
    }
  }, [initialValue, isInitialized]);
  useEffect(() => {
    if (isInitialized && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isInitialized]);

  // Handle updates to initialValue after initialization (e.g., AI suggestions)
  useEffect(() => {
    if (isInitialized && initialValue && isFromAI) {
      const { contentBlocks, entityMap } = convertFromHTML(initialValue);
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [initialValue, isFromAI, isInitialized]);

  // Prevent typing beyond maxLength before it reaches the editor state
  const handleBeforeInput = (chars: string) => {
    const currentContent = editorState.getCurrentContent();
    const currentLength = currentContent.getPlainText().length;
    if (
      maxLength !== undefined &&
      maxLength >= 0 &&
      currentLength >= maxLength
    ) {
      return "handled";
    }
    return "not-handled";
  };

  // Handle paste operations gracefully and enforce maxLength
  const handlePastedText = (text: string, html?: string) => {
    const currentContent = editorState.getCurrentContent();
    const currentLength = currentContent.getPlainText().length;

    if (maxLength !== undefined && maxLength >= 0) {
      const remaining = maxLength - currentLength;
      if (remaining <= 0) {
        return "handled";
      }
      if (text.length > remaining) {
        const newText = text.substring(0, remaining);
        const newContent = ContentState.createFromText(
          currentContent.getPlainText() + newText
        );
        const newEditorState = EditorState.push(
          editorState,
          newContent,
          "insert-characters"
        );
        // Use the same pipeline as typing changes
        handleEditorChange(newEditorState);
        return "handled";
      }
    }
    return "not-handled";
  };

  const handleEditorChange = React.useCallback(
    (newState: EditorState) => {
      const contentState = newState.getCurrentContent();
      const plainText = contentState.getPlainText();

      // Enforce maxLength if specified - reject if exceeds limit
      if (
        maxLength !== undefined &&
        maxLength >= 0 &&
        plainText.length > maxLength
      ) {
        // Don't update state if exceeds maxLength
        return;
      }

      setEditorState(newState);
      const finalPlainText = plainText.trim().replace(/[\r\n]/g, "");

      //Wraps <p> tag: Existing functionality
      const contentHTML = !!finalPlainText ? stateToHTML(contentState) : "";

      //Wraps <div>
      // const contentHTML = !!finalPlainText
      //   ? stateToHTML(contentState, { defaultBlockTag: "div" })
      //   : "";

      setContentStateValue(contentHTML);
      onContentChange(
        formField?.field || "",
        contentHTML,
        finalPlainText,
        isFromAI,
        contentHTML
      );
    },
    [formField?.field, maxLength]
  );

  const applyInlineStyle = (style: DraftInlineStyleType) => {
    const newState = RichUtils.toggleInlineStyle(editorState, style);
    handleEditorChange(newState);
  };

  const applyBlockType = (blockType: string) => {
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    handleEditorChange(newState);
  };

  const renderButton = (
    text: string,
    icon: ReactElement,
    style: string,
    isInline: boolean,
    active: boolean
  ) => (
    <button
      onClick={() =>
        isInline
          ? applyInlineStyle(style as DraftInlineStyleType)
          : applyBlockType(style)
      }
      disabled={isDisabled}
      style={{
        fontWeight: active ? "bold" : "normal",
        marginRight: "5px",
        padding: "5px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        border: "1px solid #DEE2E6",
        borderRadius: "3px",
        backgroundColor: active ? "#ddd" : "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: isDisabled ? "#adb5bd" : "#495057",
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      {text !== "" ? text : icon}
    </button>
  );

  const blockType = RichUtils.getCurrentBlockType(editorState);

  return (
    <div style={{ width: "100%" }} data-formfieldid={formField?.id}>
      <div
        style={{
          border: "1px solid #CED4DA",
          padding: "10px",
          borderTopLeftRadius: "5px",
          borderTopRightRadius: "5px",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          backgroundColor: "#fff",
          opacity: isDisabled ? 0.6 : 1,
          pointerEvents: isDisabled ? "none" : "auto",
        }}
      >
        {[
          "header-one",
          "header-two",
          "header-three",
          "header-four",
          "header-five",
          "header-six",
        ].map((header, index) =>
          renderButton(
            `H${index + 1}`,
            <FaHeading />,
            header,
            false,
            blockType === header
          )
        )}
        {renderButton(
          "",
          <BiParagraph />,
          "unstyled",
          false,
          blockType === "unstyled"
        )}
        {renderButton(
          "",
          <FaListOl />,
          "ordered-list-item",
          false,
          blockType === "ordered-list-item"
        )}
        {renderButton(
          "",
          <FaListUl />,
          "unordered-list-item",
          false,
          blockType === "unordered-list-item"
        )}
        {renderButton(
          "",
          <FaBold />,
          "BOLD",
          true,
          editorState.getCurrentInlineStyle().has("BOLD")
        )}
        {renderButton(
          "",
          <FaItalic />,
          "ITALIC",
          true,
          editorState.getCurrentInlineStyle().has("ITALIC")
        )}
        {renderButton(
          "",
          <FaUnderline />,
          "UNDERLINE",
          true,
          editorState.getCurrentInlineStyle().has("UNDERLINE")
        )}
      </div>

      <div
        onClick={() => editorRef.current?.focus()}
        style={{
          border: "1px solid #CED4DA",
          background: "fff",
          padding: "10px",
          borderBottomLeftRadius: "5px",
          borderBottomRightRadius: "5px",
          minHeight: "200px",
          cursor: isDisabled ? "not-allowed" : "text",
          whiteSpace: "normal",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          backgroundColor: isDisabled ? "#f1f3f5" : "#fff",
          color: "#666",
          opacity: isDisabled ? 0.8 : 1,
        }}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleBeforeInput={handleBeforeInput}
          handlePastedText={handlePastedText}
          placeholder={formField?.placeholder || ""}
          readOnly={isDisabled}
        />
      </div>
      {validationMessage && (
        <div style={{ color: "red", marginTop: "5px" }}>
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default DraftEditor;
