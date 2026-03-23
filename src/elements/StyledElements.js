import styled from "styled-components";

export const LayoutWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap");
  min-height: 100vh;
  padding: 4rem 8rem;
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8fafc;
  color: #334155;

  h1 {
    color: #1e293b;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    letter-spacing: -0.025em;
  }

  h2 {
    color: #334155;
    font-weight: 600;
  }

  h3 {
    color: #475569;
    font-weight: 500;
  }
`;

export const Tab = styled.div`
  height: 3rem;
  width: 5rem;
  padding: 1rem 2rem;
  border-width: 2px;
  border-radius: 2px;
  background-color: ${(props) => (props.active ? "#61988e" : "#fff")};
  border-color: "#61988e";
  color: ${(props) => (props.active ? "#fff" : "#61988e")};
`;

export const DZDropzoneWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

export const DropzoneWrapper = styled.div`
  input {
    width: 100%;
    height: 100%;
  }
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  border-width: 2px;
  border-radius: 12px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: ${(props) => (props.isDragActive ? "#e6efed" : "#fafafa")};
  color: ${(props) => (props.isDragActive ? "#61988e" : "#bdbdbd")};
  outline: none;
  cursor: pointer;
  transition: all 0.24s ease-in-out;

  &:hover {
    border-color: ${(props) => (props.isDragActive ? "#61988e" : "#4a7a71")};
    background-color: ${(props) => (props.isDragActive ? "#e6efed" : "#f4f7f6")};
  }
`;

const getColor = (props) => {
  if (props.isDragAccept) {
    return "#61988e";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#61988e";
  }
  return "#eeeeee";
};

export const FileProcessWrapper = styled.div`
  padding: 3rem 0;
`;

export const FilenameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: auto;
  padding: 1.5rem 2rem;
  background: #ffffff;
  align-items: center;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  
  svg {
    height: 3rem;
    width: 3rem;
    margin-right: 1.5rem;
    color: #61988e;
  }
  
  p {
    font-weight: 600;
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background: #ffffff;
  min-height: 20rem;
  justify-content: start;
  color: #334155;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  border-top: 4px solid #61988e;

  h2 {
    padding: 0;
    margin: 0.5rem 0rem 1.5rem 0rem;
    color: #1e293b;
  }
`;

export const FilterTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-right: 5rem;
  width: 20rem;
`;

export const FilterDateWrapper = styled.div`
  width: 25rem;
`;

export const FilterMonthSelector = styled.button`
  font-family: "Noto Sans SC", sans-serif;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  background-color: #61988e;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(97, 152, 142, 0.3);

  &:hover {
    background-color: #4a7a71;
    box-shadow: 0 4px 6px rgba(97, 152, 142, 0.4);
  }
  
  &:active {
    background-color: #3e746a;
    box-shadow: 0 1px 2px rgba(97, 152, 142, 0.3);
    transform: translateY(1px);
  }
`;

export const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  justify-content: start;
  color: #334155;
  padding: 3rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 2rem;

  h2 {
    padding: 0;
    margin: 0.5rem 0rem 1.5rem 0rem;
    color: #1e293b;
  }
`;

export const CalcButton = styled.button`
  padding: 0.75rem 1.5rem;
  width: max-content;
  background-color: #61988e;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(97, 152, 142, 0.3);

  &:hover {
    background-color: #4a7a71;
    box-shadow: 0 4px 6px rgba(97, 152, 142, 0.4);
  }
  
  &:active {
    background-color: #3e746a;
    box-shadow: 0 1px 2px rgba(97, 152, 142, 0.3);
    transform: translateY(1px);
  }
`;

export const ExportButton = styled.button`
  padding: 0.75rem 1.5rem;
  width: max-content;
  background-color: #61988e;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(97, 152, 142, 0.3);
  margin-top: 1rem;

  &:hover {
    background-color: #4a7a71;
    box-shadow: 0 4px 6px rgba(97, 152, 142, 0.4);
  }
  
  &:active {
    background-color: #3e746a;
    box-shadow: 0 1px 2px rgba(97, 152, 142, 0.3);
    transform: translateY(1px);
  }
`;

export const RecognizedList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 500px;

  li {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #334155;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }
  }

  .status-success {
    color: #059669;
    background-color: #d1fae5;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .status-error {
    color: #dc2626;
    background-color: #fee2e2;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 0 8px 8px 0;
  color: #991b1b;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &::before {
    content: "⚠️";
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`;

export const ResultsHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.75rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-weight: 500;
    color: #64748b;
    margin: 0;
  }

  span {
    margin-right: 3rem;
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #f1f5f9;
    border-radius: 6px;
    margin-top: 1rem;
  }
`;

export const ResultsTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;

  td,
  th {
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    padding: 1rem 1.5rem;
  }

  th {
    font-size: 1.1rem;
    font-weight: 600;
    background-color: #f8fafc;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tr {
    background-color: #ffffff;
    transition: background-color 0.2s;
  }
  
  tr:hover {
    background-color: #f1f5f9;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;
