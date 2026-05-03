import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper, RecognizedList, ErrorMessage } from "../../elements/StyledElements";
import * as XLSX from "xlsx";
import { MOProcess } from "./MOProcess";

export const MODropzone = () => {
  const [workbook, setWorkbook] = useState(null);
  const [error, setError] = useState("");
  const [sheetStatus, setSheetStatus] = useState({});

  const requiredSheets = [
    "销售明细",
    "运费",
    "促销",
    "调账",
    "新增铺底",
    "回款",
    "期初数",
    "其它",
  ];

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    setWorkbook(null);
    setSheetStatus({});

    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const status = {};
        requiredSheets.forEach(s => {
          status[s] = wb.SheetNames.includes(s);
        });
        setSheetStatus(status);

        const missingSheets = requiredSheets.filter(s => !status[s]);

        if (missingSheets.length > 0) {
          setError(`缺少必需的工作表：${missingSheets.join(", ")}`);
        } else {
          setWorkbook(wb);
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
      <h1>月度订单明细表</h1>
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {!isDragActive &&
          "点击这里或者拖拽文件至这里进行上传（需包含销售明细、运费、促销等8张表）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>

      {Object.keys(sheetStatus).length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>已识别的表格：</h3>
          <RecognizedList>
            {requiredSheets.map(sheet => (
              <li key={sheet}>
                <span>{sheet}</span>
                {sheetStatus[sheet] ? (
                  <span className="status-success">✅ 已加载</span>
                ) : (
                  <span className="status-error">❌ 未找到</span>
                )}
              </li>
            ))}
          </RecognizedList>
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {workbook && <MOProcess workbook={workbook} />}
    </>
  );
};
