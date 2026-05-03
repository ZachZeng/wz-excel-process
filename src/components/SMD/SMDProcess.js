import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton } from "../../elements/StyledElements";
import { smdParse } from "./smdParse";

export const SMDProcess = ({ basePriceSheet, smdSalesSheet, orderDetailSheet }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const res = smdParse(basePriceSheet, smdSalesSheet, orderDetailSheet);
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  }, [basePriceSheet, smdSalesSheet, orderDetailSheet]);

  const exportToExcel = () => {
    if (!results || results.length === 0) {
      alert("无数据可导出");
      return;
    }

    // results 是一个二维数组 (AOA)
    const ws = XLSX.utils.aoa_to_sheet(results);
    const wb = {
      Sheets: { "对账单核对": ws },
      SheetNames: ["对账单核对"]
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" 
    });
    FileSaver.saveAs(data, "苏明达对账单核对结果.xlsx");
  };

  if (error) {
    return (
      <div style={{ marginTop: '20px', color: 'red' }}>
        <h3>处理出错：</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!results) {
    return <div style={{ marginTop: '20px' }}>处理中...</div>;
  }

  // 计算有多少行需要检查
  let checkCount = 0;
  let dataRowCount = 0;
  
  // 假设第一行或第二行是表头
  const headerIdx = results.findIndex(row => row.includes('订单明细成本价'));
  if (headerIdx !== -1) {
    for (let i = headerIdx + 1; i < results.length; i++) {
      const row = results[i];
      if (!row || row.length === 0) continue;
      dataRowCount++;
      
      const cost = row[row.length - 2];
      const price = row[row.length - 1];
      
      if (cost === '检查' || price === '检查') {
        checkCount++;
      }
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>处理成功！</h3>
      <p>共处理了 <strong>{dataRowCount}</strong> 条明细数据。</p>
      {checkCount > 0 && (
        <p style={{ color: '#d97706' }}>
          ⚠️ 发现 <strong>{checkCount}</strong> 条记录无法完全匹配，已在结果中标注为“检查”。
        </p>
      )}
      <ExportButton onClick={exportToExcel}>导出对账单核对表</ExportButton>
    </div>
  );
};
