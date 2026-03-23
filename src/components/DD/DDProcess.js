import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton } from "../../elements/StyledElements";
import { ddParse } from "./ddParse";

export const DDProcess = ({ sheet }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const res = ddParse(sheet);
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  }, [sheet]);

  const exportToExcel = () => {
    if (!results || (results.rule1Errors.length === 0 && results.rule2Errors.length === 0)) {
      alert("无数据可导出");
      return;
    }

    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.json_to_sheet(results.rule1Errors);
    XLSX.utils.book_append_sheet(wb, ws1, "账户不一致客户");
    
    const ws2 = XLSX.utils.json_to_sheet(results.rule2Errors);
    XLSX.utils.book_append_sheet(wb, ws2, "单价不一致明细");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" 
    });
    FileSaver.saveAs(data, "订单核对结果.xlsx");
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

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>处理成功！</h3>
      <p>发现 <strong>{results.rule1Errors.length}</strong> 个账户不一致的客户。</p>
      <p>发现 <strong>{results.rule2Errors.length}</strong> 条单价不一致的明细。</p>
      <ExportButton onClick={exportToExcel}>导出结果</ExportButton>
    </div>
  );
};
