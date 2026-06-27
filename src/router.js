import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import styled from "styled-components";

import { PDDropzone, DZProcess, RecycleDropzone } from "./components";
import { CXDropzone } from "./components/CX/CXDropzone";
import { DDDropzone } from "./components/DD/DDDropzone";
import { MODropzone } from "./components/MO/MODropzone";
import { YFDropzone } from "./components/YF/YFDropzone";
import { SMDDropzone } from "./components/SMD/SMDDropzone";
import { YBBDropzone } from "./components/YBB/YBBDropzone";
import { FYBDropzone } from "./components/FYB/FYBDropzone";

const NavUnlisted = styled.ul`
  display: flex;
  margin: 0 0 2rem 0;
  padding: 0.5rem;
  background-color: #f4f7f6;
  border-radius: 12px;
  gap: 0.5rem;
  width: fit-content;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;

  a {
    text-decoration: none;
  }

  li {
    color: #61988e;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    list-style: none;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    margin: 0;
    border: none;
  }

  a:not(.active) li:hover {
    color: #4a7a71;
    background-color: #e6efed;
  }

  .active {
    li {
      background-color: #61988e;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(97, 152, 142, 0.3);
    }
  }
`;

export default function NaviRouter() {
  return (
    <Router
      basename="/wz-excel-process"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <NavUnlisted>
          <NavLink to="/">
            <li>铺底统计</li>
          </NavLink>

          <NavLink to="/dz">
            <li>对账</li>
          </NavLink>

          <NavLink to="/recycle">
            <li>未回收账单</li>
          </NavLink>

          <NavLink to="/cx">
            <li>促销余额核对</li>
          </NavLink>

          <NavLink to="/dd">
            <li>订单核对</li>
          </NavLink>

          <NavLink to="/mo">
            <li>月度订单明细表</li>
          </NavLink>

          <NavLink to="/yf">
            <li>运费核对</li>
          </NavLink>

          <NavLink to="/smd">
            <li>苏明达对账</li>
          </NavLink>

          <NavLink to="/ybb">
            <li>月报表</li>
          </NavLink>

          <NavLink to="/fyb">
            <li>费用表</li>
          </NavLink>
        </NavUnlisted>

        <Routes>
          <Route path="/" element={<PDDropzone />} />
          <Route path="/dz" element={<DZProcess />} />
          <Route path="/recycle" element={<RecycleDropzone />} />
          <Route path="/cx" element={<CXDropzone />} />
          <Route path="/dd" element={<DDDropzone />} />
          <Route path="/mo" element={<MODropzone />} />
          <Route path="/yf" element={<YFDropzone />} />
          <Route path="/smd" element={<SMDDropzone />} />
          <Route path="/ybb" element={<YBBDropzone />} />
          <Route path="/fyb" element={<FYBDropzone />} />
        </Routes>
      </div>
    </Router>
  );
}
