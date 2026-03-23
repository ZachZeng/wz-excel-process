import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper, ErrorMessage } from "../../elements/StyledElements";
import * as XLSX from "xlsx";
import { DDProcess } from "./DDProcess";

export const DDDropzone = () => {
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    setSheet(null);

    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        let targetSheet = null;

        // 优先寻找名为“订单明细”或“销售明细”的表
        for (const name of wb.SheetNames) {
          if (name.includes("订单明细") || name.includes("销售明细")) {
            targetSheet = wb.Sheets[name];
            break;
          }
        }

        // 如果没找到，尝试找包含所需列的表
        if (!targetSheet) {
          for (const name of wb.SheetNames) {
            const ws = wb.Sheets[name];
            const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
            for (let i = 0; i < Math.min(aoa.length, 10); i++) {
              const rowStr = (aoa[i] || [])
                .map((c) => String(c || ""))
                .join("");
              if (
                rowStr.includes("客户名称") &&
                rowStr.includes("计价品种") &&
                rowStr.includes("账户") &&
                rowStr.includes("小计")
              ) {
                targetSheet = ws;
                break;
              }
            }
            if (targetSheet) break;
          }
        }

        if (targetSheet) {
          setSheet(targetSheet);
        } else {
          setError(
            "未能找到包含（客户名称、计价品种、账户、小计、数量）的订单明细表",
          );
        }
      } catch (err) {
        setError("读取文件出错：" + err.message);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
    multiple: false,
  });

  return (
    <>
      <h1>订单核对</h1>
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {!isDragActive &&
          "点击这里或者拖拽文件至这里进行上传（支持订单明细表）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {sheet && <DDProcess sheet={sheet} />}
    </>
  );
};
