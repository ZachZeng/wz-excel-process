import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper } from "../../elements/StyledElements";
import * as XLSX from "xlsx";
import { YFProcess } from "./YFProcess";

export const YFDropzone = () => {
  const [ruleSheet, setRuleSheet] = useState(null);
  const [freightSheet, setFreightSheet] = useState(null);
  const [error, setError] = useState("");

  const identifyAndSetSheets = (wb) => {
    let newRule = ruleSheet;
    let newFreight = freightSheet;

    wb.SheetNames.forEach((sheetName) => {
      const ws = wb.Sheets[sheetName];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      let isRule = false;
      let isFreight = false;

      for (let i = 0; i < Math.min(aoa.length, 10); i++) {
        const rowStr = (aoa[i] || []).map((c) => String(c || "")).join("");
        if (rowStr.includes("是否免运费") || sheetName.includes("规则")) {
          isRule = true;
        }
        if (rowStr.includes("发货日期") || sheetName.includes("运费")) {
          isFreight = true;
        }
      }

      if (isRule) newRule = ws;
      if (isFreight) newFreight = ws;
    });

    setRuleSheet(newRule);
    setFreightSheet(newFreight);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      setError("");
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            identifyAndSetSheets(wb);
          } catch (err) {
            setError("读取文件出错：" + err.message);
          }
        };
        reader.readAsBinaryString(file);
      });
    },
    [ruleSheet, freightSheet],
  );

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  const isReady = ruleSheet && freightSheet;

  return (
    <>
      <h1>运费核对</h1>
      <DropzoneWrapper {...getRootProps()}>
        <input {...getInputProps()} />
        {!isDragActive &&
          "点击这里或者拖拽文件至这里进行上传（支持单文件多表或多文件）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>

      <div style={{ marginTop: "20px" }}>
        <h3>已识别的表格：</h3>
        <ul>
          <li>规则表: {ruleSheet ? "✅ 已加载" : "❌ 未找到"}</li>
          <li>运费表: {freightSheet ? "✅ 已加载" : "❌ 未找到"}</li>
        </ul>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {isReady && (
        <YFProcess ruleSheet={ruleSheet} freightSheet={freightSheet} />
      )}
    </>
  );
};
