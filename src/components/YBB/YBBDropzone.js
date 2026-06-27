import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import styled from "styled-components";
import { DropzoneWrapper, ErrorMessage, ExportButton } from "../../elements/StyledElements";
import { YBBProcess } from "./YBBProcess";

// ─── styled components ────────────────────────────────────────────────────────

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FileSlot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SlotLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
`;

const UploadedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 8px;
  color: #065f46;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ManualSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  border-top: 4px solid #61988e;
`;

const SectionTitle = styled.h3`
  color: #1e293b;
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;

  label {
    width: 120px;
    font-size: 0.9rem;
    color: #475569;
    flex-shrink: 0;
  }

  input[type="number"] {
    width: 160px;
    padding: 0.4rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #334155;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #61988e;
    }
  }
`;

const 营外Table = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
`;

const 营外Header = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  padding-bottom: 0.25rem;
`;

const 营外Input = styled.input`
  padding: 0.4rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
  width: 100%;

  &:focus {
    border-color: #61988e;
  }
`;

// ─── single dropzone slot ─────────────────────────────────────────────────────

function SingleDropzone({ label, hint, workbook, onLoad, onError }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: "binary" });
          onLoad(wb, file.name);
        } catch (err) {
          onError("读取文件出错：" + err.message);
        }
      };
      reader.readAsBinaryString(file);
    },
    [onLoad, onError]
  );

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/vnd.ms-excel": [".xls"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: false,
  });

  return (
    <FileSlot>
      <SlotLabel>{label}</SlotLabel>
      {workbook ? (
        <UploadedBadge>✅ {workbook.filename}</UploadedBadge>
      ) : (
        <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive} style={{ padding: "1.5rem", minHeight: "80px", fontSize: "0.85rem", textAlign: "center" }}>
          <input {...getInputProps()} />
          {isDragActive ? "放下文件" : hint}
        </DropzoneWrapper>
      )}
      {workbook && (
        <button
          onClick={() => onLoad(null, "")}
          style={{ fontSize: "0.8rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", textAlign: "left" }}
        >
          重新上传
        </button>
      )}
    </FileSlot>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export const YBBDropzone = () => {
  const [files, setFiles] = useState({ 基础数据: null, 上月报表: null, 上年报表: null });
  const [error, setError] = useState("");

  // Manual inputs
  const [yzOEM促销费, set促销费] = useState("");
  const [yzOEM工资奖金, set工资奖金] = useState("");
  const [营业外, set营业外] = useState([
    { 项目: "", 收入: "", 支出: "" },
    { 项目: "", 收入: "", 支出: "" },
    { 项目: "", 收入: "", 支出: "" },
    { 项目: "", 收入: "", 支出: "" },
  ]);

  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);

  const handleLoad = (key) => (wb, filename) => {
    setError("");
    setResult(null);
    setReady(false);
    setFiles((prev) => ({
      ...prev,
      [key]: wb ? { wb, filename } : null,
    }));
  };

  const handleError = (msg) => setError(msg);

  const update营外 = (idx, field, val) => {
    set营业外((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const allFilesReady = files.基础数据 && files.上月报表 && files.上年报表;

  const handleGenerate = () => {
    setError("");
    try {
      const manualInputs = {
        yzOEM促销费: parseFloat(yzOEM促销费) || 0,
        yzOEM工资奖金: parseFloat(yzOEM工资奖金) || 0,
        营业外: 营业外
          .filter((r) => r.项目 || r.收入 || r.支出)
          .map((r) => ({
            项目: r.项目 || "",
            收入: parseFloat(r.收入) || 0,
            支出: parseFloat(r.支出) || 0,
          })),
      };
      setResult({ 基础数据WB: files.基础数据.wb, 上月WB: files.上月报表.wb, 上年WB: files.上年报表.wb, manualInputs });
      setReady(true);
    } catch (err) {
      setError("处理出错：" + err.message);
    }
  };

  return (
    <>
      <h1>月报表生成</h1>

      <FileGrid>
        <SingleDropzone
          label="基础数据"
          hint="上传 基础数据.xlsx（含销售汇总、费用表等）"
          workbook={files.基础数据}
          onLoad={handleLoad("基础数据")}
          onError={handleError}
        />
        <SingleDropzone
          label="上月报表"
          hint="上传上月的最终报表.xls"
          workbook={files.上月报表}
          onLoad={handleLoad("上月报表")}
          onError={handleError}
        />
        <SingleDropzone
          label="上年同期报表"
          hint="上传上年同月的最终报表.xls"
          workbook={files.上年报表}
          onLoad={handleLoad("上年报表")}
          onError={handleError}
        />
      </FileGrid>

      <ManualSection>
        <SectionTitle>手工录入项（允真 / OEM）</SectionTitle>

        <InputRow>
          <label>促销费</label>
          <input
            type="number"
            placeholder="0"
            value={yzOEM促销费}
            onChange={(e) => set促销费(e.target.value)}
          />
        </InputRow>
        <InputRow>
          <label>工资奖金（个人部分）</label>
          <input
            type="number"
            placeholder="0"
            value={yzOEM工资奖金}
            onChange={(e) => set工资奖金(e.target.value)}
          />
        </InputRow>
      </ManualSection>

      <ManualSection>
        <SectionTitle>营业外收入 / 支出（选填，最多 4 行）</SectionTitle>
        <营外Table>
          <营外Header>项目名称</营外Header>
          <营外Header>收入</营外Header>
          <营外Header>支出</营外Header>
          {营业外.map((row, i) => (
            <React.Fragment key={i}>
              <营外Input
                type="text"
                placeholder={`项目 ${i + 1}`}
                value={row.项目}
                onChange={(e) => update营外(i, "项目", e.target.value)}
              />
              <营外Input
                type="number"
                placeholder="0"
                value={row.收入}
                onChange={(e) => update营外(i, "收入", e.target.value)}
              />
              <营外Input
                type="number"
                placeholder="0"
                value={row.支出}
                onChange={(e) => update营外(i, "支出", e.target.value)}
              />
            </React.Fragment>
          ))}
        </营外Table>
      </ManualSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ExportButton
        onClick={handleGenerate}
        disabled={!allFilesReady}
        style={{ opacity: allFilesReady ? 1 : 0.5, cursor: allFilesReady ? "pointer" : "not-allowed" }}
      >
        生成最终报表
      </ExportButton>

      {ready && result && (
        <YBBProcess
          基础数据WB={result.基础数据WB}
          上月WB={result.上月WB}
          上年WB={result.上年WB}
          manualInputs={result.manualInputs}
        />
      )}
    </>
  );
};
