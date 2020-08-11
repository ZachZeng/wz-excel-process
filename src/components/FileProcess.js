import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as ExcelSvg } from "../images/excel.svg";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import zhCN from "date-fns/locale/zh-CN";
import "react-datepicker/dist/react-datepicker.css";
import "./monthpicker.css";
import {
  FilterWrapper,
  FilterTextWrapper,
  ResultWrapper,
  CalcButton,
  ExportButton,
  FilterDateWrapper,
  ErrorMessage,
  FilterMonthSelector
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
import { Results } from "./Results";

export const FileProcess = ({ filename, data }) => {
  const [clients, setClients] = useState();
  const [sales, setSales] = useState();
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [resultClient, setResultClient] = useState({ value: "", label: "" });
  const [resultSale, setResultSale] = useState({ value: "", label: "" });
  const [resultMonth, setResultMonth] = useState();
  const [currentClient, setCurrentClient] = useState({ value: "", label: "" });
  const [currentSale, setCurrentSale] = useState({ value: "", label: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [filteredData, setFilteredData] = useState();
  const [printData, setPrintData] = useState();
  const [month, setMonth] = useState(new Date());
  registerLocale("zhCN", zhCN);

  const [totalNum, setTotalNum] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  //   console.log(data);

  const CustomInput = ({ value, onClick }) => (
    <FilterMonthSelector onClick={onClick}>{value}</FilterMonthSelector>
  );

  const handleMonthChange = newValue => {
    setMonth(newValue);
  };

  const handleClientChange = currentClient => {
    setCurrentClient(currentClient);
  };

  const handlesaleChange = currentSale => {
    setCurrentSale(currentSale);
  };

  useEffect(() => {
    if (typeof data !== "undefined") {
      let clientlist = [];
      let salelist = [];
      let datelist = [];
      data.map(item => {
        if (!clientlist.some(e => e.value === item["客户名"])) {
          clientlist.push({ value: item["客户名"], label: item["客户名"] });
        }
        if (!salelist.some(e => e.value === item["业务员"])) {
          salelist.push({ value: item["业务员"], label: item["业务员"] });
        }
        if (!datelist.includes(item["日期"])) {
          datelist.push(new Date(item["日期"]));
        }
      });
      clientlist.unshift({
        value: "全选",
        label: "全选"
      });
      salelist.unshift({
        value: "全选",
        label: "全选"
      });
      setSales(salelist);
      setClients(clientlist);
      setMinDate(new Date(Math.min.apply(null, datelist)));
      setMaxDate(new Date(Math.max.apply(null, datelist)));
      setMonth(Math.min.apply(null, datelist));
    }
  }, [data]);

  const calcFunc = () => {
    console.log(data);
    console.log(currentSale);
    console.log(currentClient);
    console.log(month);

    if (
      currentSale === undefined ||
      currentSale["value"] === "" ||
      currentClient === undefined ||
      currentClient["value"] === ""
    ) {
      let msg = "";
      if (currentSale === undefined || currentSale["value"] === "") {
        msg += "请选择业务员; ";
      }
      if (currentClient === undefined || currentClient["value"] === "") {
        msg += "请选择客户; ";
      }
      setErrorMessage(msg);
      return;
    }

    setErrorMessage("");
    let newMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    newMonth.setMonth(newMonth.getMonth() + 1);
    console.log(newMonth);

    let filteredDate = data.filter(item => {
      if (item["日期"] < newMonth) {
        if (
          currentSale["value"] === "全选" &&
          currentClient["value"] === "全选"
        ) {
          return true;
        } else if (
          currentSale["value"] === "全选" &&
          currentClient["value"] !== "全选"
        ) {
          if (item["客户名"] === currentClient["value"]) {
            return true;
          }
          return false;
        } else if (
          currentSale["value"] !== "全选" &&
          currentClient["value"] === "全选"
        ) {
          if (item["业务员"] === currentSale["value"]) {
            return true;
          }
          return false;
        } else {
          if (
            item["业务员"] === currentSale["value"] &&
            item["客户名"] === currentClient["value"]
          ) {
            return true;
          }
          return false;
        }
      } else {
        console.log(item["日期"] + "not in time");
        return false;
      }
    });

    let num = 0;
    let amount = 0.0;
    let pdata = [];

    if (filteredDate.length > 0) {
      filteredDate.map(item => {
        if (typeof item["数量"] === "number") {
          num += item["数量"];
        }
        amount += Number.parseFloat(item["金额"]);
        let i = { ...item };
        pdata.push(i);
      });
    }

    filteredDate.push({ 客户名: "累计", 数量: num, 金额: amount });
    pdata.push({ 客户名: "累计", 数量: num, 金额: amount });

    if (pdata.length > 0) {
      pdata.map(item => {
        if (item["客户名"] === "累计") return;
        let print_year = item["日期"].getFullYear();
        let print_month = item["日期"].getMonth();
        item["日期"] = print_year + "年" + print_month + "月";
      });
    }
    setPrintData(pdata);
    setFilteredData(filteredDate);

    setResultClient(currentClient);
    setResultSale(currentSale);
    setResultMonth(month);

    // console.log(filteredDate);
  };

  const exportToExcel = () => {
    if (printData === "") {
      alert("无数据");
      return;
    }
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(printData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const filename = "客户".concat(
      currentClient["value"],
      "_业务员",
      currentSale["value"]
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
              <h2>业务员</h2>
              <Select
                options={sales}
                value={currentSale}
                onChange={handlesaleChange}
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
          <h2>选择截止月份</h2>
          <DatePicker
            selected={month}
            onChange={date => handleMonthChange(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            maxDate={maxDate}
            minDate={minDate}
            locale="zhCN"
            customInput={<CustomInput />}
          />
        </FilterDateWrapper>
      </FilterWrapper>
      <ResultWrapper>
        <Results
          filteredData={filteredData}
          client={resultClient["value"]}
          sale={resultSale["value"]}
          month={resultMonth}
        />
        <ExportButton onClick={exportToExcel}> 导出excel文件</ExportButton>
      </ResultWrapper>
    </FileProcessWrapper>
  );
};
