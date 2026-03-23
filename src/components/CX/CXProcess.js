import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton, ErrorMessage } from "../../elements/StyledElements";
import { cxReconcile } from "./cxParse";

export const CXProcess = ({ excludeSheet, arSheet, promoSheet }) => {
  const [resultNames, setResultNames] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const names = cxReconcile(excludeSheet, arSheet, promoSheet);
      setResultNames(names);
    } catch (err) {
      setError(err.message);
    }
  }, [excludeSheet, arSheet, promoSheet]);

  const exportToExcel = () => {
    if (resultNames.length === 0) {
      alert("无数据可导出");
      return;
    }

    const exportData = resultNames.map((name) => ({ 客户名: name }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = {
      Sheets: { 汇总结果: ws },
      SheetNames: ["汇总结果"],
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(data, "促销余额核对结果.xlsx");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {error ? (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      ) : (
        <div>
          <h3>处理成功！</h3>
          <p>共筛选出 {resultNames.length} 个客户（差额不为 0）。</p>
          <ExportButton onClick={exportToExcel}>导出结果</ExportButton>
        </div>
      )}
    </div>
  );
};
