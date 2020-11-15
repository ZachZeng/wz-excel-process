import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileProcess } from ".";
import { DropzoneWrapper } from "../elements/StyledElements";
import * as XLSX from "xlsx";

export const ReplaceDropzone = props => {
  const [data, setData] = useState();

  const onDrop = useCallback(acceptedFiles => {
    var f = acceptedFiles[0];
    if (!f) {
      return;
    }
    var name = f.name;
    const reader = new FileReader();
    reader.onload = evt => {
      // evt = on_file_select event
      /* Parse data */
      const bstr = evt.target.result;
      // var length = bstr.byteLength;
      // var binary = "";
      // for (var i = 0; i < length; i++) {
      //   binary += String.fromCharCode(bstr[i]);
      // }

      const wb = XLSX.read(bstr, {
        type: "binary",
        cellDates: true
      });
      /* Get worksheets */
      const wsnames = wb.SheetNames;

      /* Convert to json */
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsnames[0]], {
        dateNF: "mm/dd/yyyy;@"
      });
      /* Update state */
      setData(data);
      props.onDropFile(data);
    };
    reader.readAsBinaryString(f);
  }, []);

  const {
    isDragActive,
    getRootProps,
    getInputProps,
    isDragReject,
    isDragAccepted,
    acceptedFiles,
    rejectedFiles
  } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls"
  });

  return (
    <>
      <h3>产品代替</h3>
      <DropzoneWrapper {...getRootProps()}>
        <input {...getInputProps()} />
        {!isDragActive && "点击这里或者拖拽文件至这里进行上传"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>
    </>
  );
};
