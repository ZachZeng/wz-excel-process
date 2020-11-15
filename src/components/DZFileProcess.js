import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton } from "../elements/StyledElements";

export const DZFileProcess = ({ sumData, detailData, replaceData }) => {
  const [dict, setDict] = useState();
  useEffect(() => {
    let dict = {};
    replaceData.map(item => {
      dict[item["产品名称"]] = item["替代品种"];
    });
    setDict(dict);
  }, [replaceData]);

  const exportToExcel = () => {
    if (sumData === "") {
      alert("无数据");
      return;
    }

    //////////////////////////////

    let i = 16;
    let prevItem = sumData[`B${i}`];
    let mergeDict = [];
    let startBrand = { c: 2, r: i - 1 };
    let endBrand = { c: 2, r: i - 1 };
    let startLend = { c: 3, r: i - 1 };
    let endLend = { c: 3, r: i - 1 };
    let startLoan = { c: 4, r: i - 1 };
    let endLoan = { c: 4, r: i - 1 };
    let startBalance = { c: 5, r: i - 1 };
    let endBalance = { c: 5, r: i - 1 };

    while (1) {
      i++;
      let currentItem = sumData[`B${i}`];
      if (currentItem.v === "合计") {
        break;
      }
      if (currentItem.v === prevItem.v) {
        //need merge

        //for brand
        endBrand = { c: 2, r: i - 1 };

        //for lend
        endLend = { c: 3, r: i - 1 };
        //add number
        let num =
          parseFloat(sumData[`D${i}`].v) + parseFloat(sumData[`D${i - 1}`].v);
        sumData[`D${i}`].v = num.toString();
        sumData[`D${i - 1}`].v = num.toString();

        //for loan
        endLoan = { c: 4, r: i - 1 };
        //add number
        num =
          parseFloat(sumData[`E${i}`].v) + parseFloat(sumData[`E${i - 1}`].v);
        sumData[`E${i}`].v = num.toString();
        sumData[`E${i - 1}`].v = num.toString();

        //for balance
        endBalance = { c: 5, r: i - 1 };
        //change number
        sumData[`F${i - 1}`].v = sumData[`F${i}`].v;
      } else {
        //push if more than 1
        if (endBrand !== startBrand) {
          mergeDict.push({
            s: startBrand,
            e: endBrand
          });

          mergeDict.push({
            s: startLend,
            e: endLend
          });

          mergeDict.push({
            s: startLoan,
            e: endLoan
          });

          mergeDict.push({
            s: startBalance,
            e: endBalance
          });
        }

        //change start to next
        startBrand = { c: 2, r: i - 1 };
        endBrand = { c: 2, r: i - 1 };
        startLend = { c: 3, r: i - 1 };
        endLend = { c: 3, r: i - 1 };
        startLoan = { c: 4, r: i - 1 };
        endLoan = { c: 4, r: i - 1 };
        startBalance = { c: 5, r: i - 1 };
        endBalance = { c: 5, r: i - 1 };
      }
      prevItem = sumData[`B${i}`];
    }

    ///////////////////////

    let newDetailData = replace(detailData);

    sumData["!merges"] = sumData["!merges"].concat(mergeDict);

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const wb = {
      Sheets: { sum: sumData, detail: XLSX.utils.json_to_sheet(newDetailData) },
      SheetNames: ["sum", "detail"]
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const filename = "test";
    FileSaver.saveAs(data, filename + fileExtension);
  };

  const replace = detailData => {
    return detailData.map(item => {
      if (item.__EMPTY_4 && item.__EMPTY_4 !== "品种") {
        let newItem = { ...item };
        if (newItem.__EMPTY_4 in dict) {
          newItem.__EMPTY_4 = dict[newItem.__EMPTY_4];
          return newItem;
        } else return item;
      }
      return item;
    });
  };

  return (
    <div style={{ marginBottom: 100 }}>
      <ExportButton onClick={exportToExcel}>导出</ExportButton>
    </div>
  );
};
