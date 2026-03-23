import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton } from "../../elements/StyledElements";
import { moParse } from "./moParse";

export const MOProcess = ({ workbook }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const res = moParse(workbook);
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  }, [workbook]);

  const exportToExcel = () => {
    if (!results || results.length === 0) {
      alert("无数据可导出");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(results);
    const wb = {
      Sheets: { 汇总: ws },
      SheetNames: ["汇总"],
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(data, "月度订单明细表_汇总结果.xlsx");
  };

  if (error) {
    return (
      <div style={{ marginTop: "20px", color: "red" }}>
        <h3>处理出错：</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!results) {
    return <div style={{ marginTop: "20px" }}>处理中...</div>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>处理成功！</h3>
      <p>
        共汇总了 <strong>{results.length}</strong> 个客户的数据。
      </p>
      <ExportButton onClick={exportToExcel}>导出汇总结果</ExportButton>
    </div>
  );
};
