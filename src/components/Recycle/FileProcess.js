import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as ExcelSvg } from "../../images/excel.svg";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import zhCN from "date-fns/locale/zh-CN";
import "react-datepicker/dist/react-datepicker.css";
import "../PD/monthpicker.css";
import {
  FilterWrapper,
  FilterTextWrapper,
  ResultWrapper,
  CalcButton,
  ExportButton,
  FilterDateWrapper,
  ErrorMessage,
  FilterMonthSelector,
} from "../../elements/StyledElements";
import Select from "react-select";
import {
  FileProcessWrapper,
  FilenameWrapper,
} from "../../elements/StyledElements";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Results } from "./Results";

const recycleMonthOptions = [...Array(12).keys()].map((number) => {
  if (number === 11) {
    return {
      value: 12,
      label: "1年以上",
    };
  }
  return {
    value: number + 1,
    label: `${number + 1}个月以上`,
  };
});

export const FileProcess = ({ filename, data }) => {
  const [clients, setClients] = useState();
  const [sales, setSales] = useState();
  const [currentClient, setCurrentClient] = useState({
    value: "全选",
    label: "全选",
  });
  const [currentSale, setCurrentSale] = useState({
    value: "全选",
    label: "全选",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [cleanedData, setCleanedData] = useState();
  const [filteredData, setFilteredData] = useState();
  const [printData, setPrintData] = useState();
  const [minDate, setMinDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [recycleMonth, setRecycleMonth] = useState(recycleMonthOptions[0]);
  registerLocale("zhCN", zhCN);

  const CustomInput = ({ value, onClick }) => (
    <FilterMonthSelector onClick={onClick}>{value}</FilterMonthSelector>
  );

  const handleMonthChange = (newValue) => {
    setMonth(newValue);
  };

  const handleClientChange = (currentClient) => {
    setCurrentClient(currentClient);
  };

  const handlesaleChange = (currentSale) => {
    setCurrentSale(currentSale);
  };

  const handleRecycleMonth = (currentMonth) => {
    setRecycleMonth(currentMonth);
  };

  useEffect(() => {
    if (typeof data !== "undefined") {
      let clientlist = [];
      let salelist = [];
      let datelist = [];
      let _cleanedData = [];

      data.forEach((item) => {
        let row = {};
        if (!salelist.some((e) => e.value === item["业务员"])) {
          salelist.push({ value: item["业务员"], label: item["业务员"] });
        }
        if (!datelist.includes(item["对账单账期"])) {
          datelist.push(new Date(item["对账单账期"]));
        }
        if (!clientlist.some((e) => e.value === item["客户名称"])) {
          clientlist.push({ value: item["客户名称"], label: item["客户名称"] });
          row = {
            客户名称: item["客户名称"],
            业务员: item["业务员"],
            对账单账期: item["对账单账期"],
          };
          _cleanedData.push(row);
        } else {
          const existingRowIndex = _cleanedData.findIndex(
            (row) => row["客户名称"] === item["客户名称"]
          );
          if (
            _cleanedData[existingRowIndex]["对账单账期"] === undefined ||
            (item["对账单账期"] !== undefined &&
              _cleanedData[existingRowIndex]["对账单账期"] < item["对账单账期"])
          ) {
            _cleanedData[existingRowIndex]["对账单账期"] = item["对账单账期"];
          }
        }
      });

      setCleanedData(_cleanedData);
      console.log("cleanedData", _cleanedData);

      clientlist.unshift({
        value: "全选",
        label: "全选",
      });
      salelist.unshift({
        value: "全选",
        label: "全选",
      });
      console.log("mindate", new Date(Math.min.apply(null, datelist)));
      setMinDate(new Date(Math.min.apply(null, datelist)));
      setSales(salelist);
      setClients(clientlist);
    }
  }, [data]);

  const calcFunc = () => {
    // console.log(data);
    // console.log(currentSale);
    // console.log(currentClient);
    // console.log(month);

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

    let _filteredData = cleanedData.filter((item) => {
      //必定是一年以上的

      let saleClientFilter = false;

      if (
        currentSale["value"] === "全选" &&
        currentClient["value"] === "全选"
      ) {
        saleClientFilter = true;
      } else if (
        currentSale["value"] === "全选" &&
        currentClient["value"] !== "全选"
      ) {
        if (item["客户名称"] === currentClient["value"]) {
          saleClientFilter = true;
        } else {
          saleClientFilter = false;
        }
      } else if (
        currentSale["value"] !== "全选" &&
        currentClient["value"] === "全选"
      ) {
        if (item["业务员"] === currentSale["value"]) {
          saleClientFilter = true;
        } else {
          saleClientFilter = false;
        }
      } else {
        if (
          item["业务员"] === currentSale["value"] &&
          item["客户名称"] === currentClient["value"]
        ) {
          saleClientFilter = true;
        } else {
          saleClientFilter = false;
        }
      }

      let monthsToRecylceMonth = 0;

      if (item["对账单账期"] === undefined) {
        console.log("没有", item);
        monthsToRecylceMonth = -1;
      } else {
        monthsToRecylceMonth =
          (month.getFullYear() - new Date(item["对账单账期"]).getFullYear()) *
            12 +
          month.getMonth() -
          new Date(item["对账单账期"]).getMonth();
      }

      if (
        (monthsToRecylceMonth === -1 ||
          monthsToRecylceMonth >= recycleMonth.value) &&
        saleClientFilter
      ) {
        return true;
      } else {
        return false;
      }
    });

    let pdata = [];

    if (_filteredData.length > 0) {
      _filteredData.map((item) => {
        const monthsToRecylceMonth =
          item["对账单账期"] === undefined
            ? -1
            : (month.getFullYear() -
                new Date(item["对账单账期"]).getFullYear()) *
                12 +
              month.getMonth() -
              new Date(item["对账单账期"]).getMonth();
        const i = {
          业务员: item["业务员"],
          客户名称: item["客户名称"],
          未回收期数:
            monthsToRecylceMonth === -1
              ? `1年以上`
              : `${monthsToRecylceMonth}个月`,
        };
        pdata.push(i);
      });
    }

    console.log("pData", pdata);

    setPrintData(pdata);
    setFilteredData(_filteredData);

    // console.log(_filteredData);
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
            <div style={{ marginBottom: "1rem" }}>
              <h2>业务员</h2>
              <Select
                options={sales}
                value={currentSale}
                onChange={handlesaleChange}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <h2>客户</h2>
              <Select
                options={clients}
                value={currentClient}
                onChange={handleClientChange}
              />
            </div>
            <div>
              <h2>未回收日期</h2>
              <Select
                options={recycleMonthOptions}
                value={recycleMonth}
                onChange={handleRecycleMonth}
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
            onChange={(date) => handleMonthChange(date)}
            minDate={minDate}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            locale="zhCN"
            customInput={<CustomInput />}
          />
        </FilterDateWrapper>
      </FilterWrapper>
      <ResultWrapper>
        <Results
          printData={printData}
          client={currentClient["value"]}
          sale={currentSale["value"]}
          month={month}
          recycleMonth={recycleMonth}
        />
        <ExportButton onClick={exportToExcel}> 导出excel文件</ExportButton>
      </ResultWrapper>
    </FileProcessWrapper>
  );
};
