import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneWrapper, RecognizedList, ErrorMessage } from "../../elements/StyledElements";
import * as XLSX from "xlsx";
import { SMDProcess } from "./SMDProcess";

export const SMDDropzone = () => {
  const [basePriceSheet, setBasePriceSheet] = useState(null);
  const [smdSalesSheet, setSmdSalesSheet] = useState(null);
  const [orderDetailSheet, setOrderDetailSheet] = useState(null);
  const [error, setError] = useState("");

  const identifyAndSetSheets = (wb) => {
    let newBase = basePriceSheet;
    let newSmd = smdSalesSheet;
    let newOrder = orderDetailSheet;

    wb.SheetNames.forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      
      let isBase = false;
      let isSmd = false;
      let isOrder = false;

      for (let i = 0; i < Math.min(aoa.length, 10); i++) {
        const rowStr = (aoa[i] || []).map(c => String(c || '')).join('');
        if (rowStr.includes('结算单价') || sheetName.includes('基础单价')) {
          isBase = true;
        }
        if (rowStr.includes('客戶訂單號') || sheetName.includes('苏明达销售明细')) {
          isSmd = true;
        }
        if (rowStr.includes('订单编号') && rowStr.includes('成本') && !sheetName.includes('苏明达')) {
          isOrder = true;
        }
      }

      if (isBase) newBase = ws;
      if (isSmd) newSmd = ws;
      if (isOrder) newOrder = ws;
    });

    setBasePriceSheet(newBase);
    setSmdSalesSheet(newSmd);
    setOrderDetailSheet(newOrder);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    acceptedFiles.forEach(file => {
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
  }, [basePriceSheet, smdSalesSheet, orderDetailSheet]);

  const {
    isDragActive,
    getRootProps,
    getInputProps,
  } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  const isReady = basePriceSheet && smdSalesSheet && orderDetailSheet;

  return (
    <>
      <h1>苏明达对账</h1>
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {!isDragActive && "点击这里或者拖拽文件至这里进行上传（支持单文件多表或多文件）"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>
      
      <div style={{ marginTop: '20px' }}>
        <h3>已识别的表格：</h3>
        <RecognizedList>
          <li>
            <span>基础单价表</span>
            {basePriceSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
          <li>
            <span>苏明达销售明细表</span>
            {smdSalesSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
          <li>
            <span>订单明细表</span>
            {orderDetailSheet ? (
              <span className="status-success">✅ 已加载</span>
            ) : (
              <span className="status-error">❌ 未找到</span>
            )}
          </li>
        </RecognizedList>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </div>

      {isReady && (
        <SMDProcess 
          basePriceSheet={basePriceSheet} 
          smdSalesSheet={smdSalesSheet} 
          orderDetailSheet={orderDetailSheet} 
        />
      )}
    </>
  );
};
