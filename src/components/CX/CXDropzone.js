import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper, RecognizedList, ErrorMessage } from "../../elements/StyledElements";
import { ACCEPT_EXCEL } from "../../excelAccept";
import * as XLSX from "xlsx";
import { CXProcess } from "./CXProcess";

export const CXDropzone = () => {
  const [excludeSheet, setExcludeSheet] = useState(null);
  const [arSheet, setArSheet] = useState(null);
  const [promoSheet, setPromoSheet] = useState(null);
  const [error, setError] = useState("");

  const identifyAndSetSheets = (wb) => {
    let newExclude = excludeSheet;
    let newAr = arSheet;
    let newPromo = promoSheet;

    wb.SheetNames.forEach((sheetName) => {
      const ws = wb.Sheets[sheetName];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      // 检查前20行来识别表
      let isExclude = false;
      let isAr = false;
      let isPromo = false;

      for (let i = 0; i < Math.min(aoa.length, 20); i++) {
        const rowStr = (aoa[i] || []).map((c) => String(c || "")).join("");
        if (
          rowStr.includes("无需统计") ||
          rowStr.includes("不在统计之列") ||
          sheetName.includes("无需统计")
        ) {
          isExclude = true;
        }
        if (
          (rowStr.includes("应收账款") && rowStr.includes("账户类型")) ||
          sheetName.includes("应收账款")
        ) {
          isAr = true;
        }
        if (
          (rowStr.includes("可用金额") && rowStr.includes("客户简称")) ||
          sheetName.includes("促销活动") ||
          sheetName.includes("促销余额")
        ) {
          isPromo = true;
        }
      }

      if (isExclude) newExclude = ws;
      if (isAr) newAr = ws;
      if (isPromo) newPromo = ws;
    });

    setExcludeSheet(newExclude);
    setArSheet(newAr);
    setPromoSheet(newPromo);
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
    [excludeSheet, arSheet, promoSheet],
  );

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPT_EXCEL,
  });

  const isReady = excludeSheet && arSheet && promoSheet;

  return (
    <>
      <h1>促销余额核对</h1>
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {!isDragActive &&
          "点击这里或者拖拽文件至这里进行上传（支持单文件多表或多文件）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>

      <div style={{ marginTop: "20px" }}>
        <h3>已识别的表格：</h3>
        <RecognizedList>
          <li>
            <span>无需统计客户名单</span>
            {excludeSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
          <li>
            <span>应收账款月报</span>
            {arSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
          <li>
            <span>促销活动余额</span>
            {promoSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
        </RecognizedList>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </div>

      {isReady && (
        <CXProcess
          excludeSheet={excludeSheet}
          arSheet={arSheet}
          promoSheet={promoSheet}
        />
      )}
    </>
  );
};
