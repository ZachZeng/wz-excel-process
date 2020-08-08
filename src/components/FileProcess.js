import React, { useState, useEffect } from "react";
import { ReactComponent as ExcelSvg } from "../images/excel.svg";
import { DateRange } from "react-date-range";
import {
  FilterWrapper,
  FilterTextWrapper,
  ResultWrapper,
  CalcButton,
  ExportButton,
  FilterDateWrapper,
  ErrorMessage
} from "../elements/StyledElements";
import Select from "react-select";
import {
  FileProcessWrapper,
  FilenameWrapper
} from "../elements/StyledElements";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

export const FileProcess = ({ filename, data }) => {
  const [clients, setClients] = useState();
  const [brands, setBrands] = useState();
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [currentClient, setCurrentClient] = useState();
  const [currentBrand, setCurrentBrand] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: "selection"
    }
  ]);
  const [totalNum, setTotalNum] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  //   console.log(data);

  const handleClientChange = currentClient => {
    setCurrentClient(currentClient);
  };

  const handleBrandChange = currentBrand => {
    setCurrentBrand(currentBrand);
  };

  useEffect(() => {
    if (typeof data !== "undefined") {
      let clientlist = [];
      let brandlist = [];
      let datelist = [];
      data.map(item => {
        if (!clientlist.some(e => e.value === item["客户名"])) {
          clientlist.push({ value: item["客户名"], label: item["客户名"] });
        }
        if (!brandlist.some(e => e.value === item["品牌"])) {
          brandlist.push({ value: item["品牌"], label: item["品牌"] });
        }
        if (!datelist.includes(item["日期"])) {
          datelist.push(new Date(item["日期"]));
        }
      });
      brandlist.unshift({
        value: "全选",
        label: "全选"
      });
      clientlist.unshift({
        value: "全选",
        label: "全选"
      });
      setBrands(brandlist);
      setClients(clientlist);
      setMinDate(new Date(Math.min.apply(null, datelist)));
      setMaxDate(new Date(Math.max.apply(null, datelist)));
      console.log(brandlist);
    }
  }, [data]);

  const calcFunc = () => {
    console.log(currentBrand);
    console.log(currentClient);
    console.log(dateRange);

    if (
      currentBrand === undefined ||
      currentClient === undefined ||
      dateRange[0]["startDate"] === null ||
      dateRange[0]["endDate"] === null
    ) {
      let msg = "";
      if (currentBrand === undefined) {
        msg += "请选择品牌; ";
      }
      if (currentClient === undefined) {
        msg += "请选择客户; ";
      }
      if (dateRange[0]["startDate"] === null) {
        msg += "请设定开始时间; ";
      }
      if (dateRange[0]["endDate"] === null) {
        msg += "请设定结束时间; ";
      }
      setErrorMessage(msg);
      return;
    }

    setErrorMessage("");

    let filteredDate = data.filter(item => {
      let itemdate = new Date(item["日期"]);
      if (
        currentBrand["value"] === "全选" &&
        currentClient["value"] === "全选"
      ) {
        return true;
      } else if (
        currentBrand["value"] === "全选" &&
        currentClient["value"] !== "全选"
      ) {
        if (
          item["客户名"] === currentClient["value"] &&
          itemdate >= dateRange[0]["startDate"] &&
          itemdate <= dateRange[0]["endDate"]
        ) {
          return true;
        }
        return false;
      } else if (
        currentBrand["value"] !== "全选" &&
        currentClient["value"] === "全选"
      ) {
        if (
          item["品牌"] === currentBrand["value"] &&
          itemdate >= dateRange[0]["startDate"] &&
          itemdate <= dateRange[0]["endDate"]
        ) {
          return true;
        }
        return false;
      } else {
        if (
          item["品牌"] === currentBrand["value"] &&
          item["客户名"] === currentClient["value"] &&
          itemdate >= dateRange[0]["startDate"] &&
          itemdate <= dateRange[0]["endDate"]
        ) {
          return true;
        }
        return false;
      }
    });

    let num = 0;
    let amount = 0;
    setFilteredData(filteredDate);
    if (filteredDate.length > 0) {
      filteredDate.map(item => {
        if (typeof item["数量"] === "number") {
          num += item["数量"];
        }
        amount += item["金额"];
      });
    }
    filteredDate.push({ 客户名: "累计", 数量: num, 金额: amount });

    setTotalNum(num);
    setTotalAmount(amount);

    console.log(filteredDate);
  };

  const exportToExcel = () => {
    if (filteredData === "") {
      alert("无数据");
      return;
    }
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const filename = "客户".concat(
      currentClient["value"],
      "_品牌",
      currentBrand["value"],
      "_时间",
      dateRange[0]["startDate"].toLocaleDateString("zh-CN"),
      "-",
      dateRange[0]["endDate"].toLocaleDateString("zh-CN")
    );
    FileSaver.saveAs(data, filename + fileExtension);
  };

  return (
    <FileProcessWrapper>
      <FilenameWrapper>
        <ExcelSvg />
        <p>{filename.replace(".xlsx", "")}</p>
      </FilenameWrapper>
      <FilterWrapper>
        <FilterTextWrapper>
          <div>
            <div style={{ marginBottom: "3rem" }}>
              <h2>品牌</h2>
              <Select
                options={brands}
                value={currentBrand}
                onChange={handleBrandChange}
              />
            </div>
            <div>
              <h2>客户</h2>
              <Select
                options={clients}
                value={currentClient}
                onChange={handleClientChange}
              />
            </div>
          </div>
          <div>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            <CalcButton onClick={calcFunc} color={"calc"}>
              {" "}
              计算{" "}
            </CalcButton>
          </div>
        </FilterTextWrapper>
        <FilterDateWrapper>
          <h2>时间区间</h2>
          <DateRange
            editableDateInputs={true}
            onChange={item => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            minDate={minDate}
            maxDate={maxDate}
            rangeColors={["#61988e"]}
          />
        </FilterDateWrapper>
      </FilterWrapper>
      <ResultWrapper>
        <div>
          <h2>累计数量</h2>
          <p>{totalNum !== 0 ? totalNum : "无数据"}</p>
        </div>
        <div>
          <h2>累计金额</h2>
          <p>{totalAmount !== 0 ? totalAmount : "无数据"}</p>
        </div>
        <ExportButton onClick={exportToExcel}> 导出excel文件</ExportButton>
      </ResultWrapper>
    </FileProcessWrapper>
  );
};
