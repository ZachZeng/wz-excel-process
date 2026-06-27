import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { DropzoneWrapper, ErrorMessage, ExportButton } from "../../elements/StyledElements";
import { FYBProcess } from "./FYBProcess";

export const FYBDropzone = () => {
  const [fileInfo, setFileInfo] = useState(null); // { wb, filename }
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        setFileInfo({ wb, filename: file.name });
      } catch (err) {
        setError("读取文件出错：" + err.message);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
  });

  const handleGenerate = () => {
    setError("");
    setResult(fileInfo.wb);
  };

  return (
    <>
      <h1>费用表生成</h1>

      {fileInfo ? (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", background: "#d1fae5",
            border: "1px solid #6ee7b7", borderRadius: "8px",
            color: "#065f46", fontSize: "0.875rem", fontWeight: 500,
          }}>
            ✅ {fileInfo.filename}
          </div>
          <button
            onClick={() => { setFileInfo(null); setResult(null); }}
            style={{ fontSize: "0.8rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            重新上传
          </button>
        </div>
      ) : (
        <DropzoneWrapper
          {...getRootProps()}
          isDragActive={isDragActive}
          style={{ marginBottom: "1.5rem", padding: "2rem", textAlign: "center" }}
        >
          <input {...getInputProps()} />
          {isDragActive
            ? "放下文件"
            : "上传 日记账.xlsx（包含现金、亮睛、维宇工作表）"}
        </DropzoneWrapper>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ExportButton
        onClick={handleGenerate}
        disabled={!fileInfo}
        style={{ opacity: fileInfo ? 1 : 0.5, cursor: fileInfo ? "pointer" : "not-allowed" }}
      >
        生成费用表
      </ExportButton>

      {result && <FYBProcess wb={result} />}
    </>
  );
};
