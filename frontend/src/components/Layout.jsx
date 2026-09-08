import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { api } from "../api";

export default function Layout() {
  const [familyName, setFamilyName] = useState("");

  useEffect(() => {
    api.getFamily().then((data) => setFamilyName(data.family?.family_name)).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-blush">
      <Sidebar />
      <div className="flex-1">
        <TopBar familyName={familyName} />
        <Outlet />
      </div>
    </div>
  );
}
