import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper } from "../../elements/StyledElements";
import * as XLSX from "xlsx";
import { MOProcess } from "./MOProcess";

export const MODropzone = () => {
  const [workbook, setWorkbook] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    setWorkbook(null);

    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        // 检查是否包含必需的表
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
        const missingSheets = requiredSheets.filter(
          (s) => !wb.SheetNames.includes(s),
        );

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
      <DropzoneWrapper {...getRootProps()}>
        <input {...getInputProps()} />
        {!isDragActive &&
          "点击这里或者拖拽文件至这里进行上传（需包含销售明细、运费、促销等8张表）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {workbook && <MOProcess workbook={workbook} />}
    </>
  );
};
