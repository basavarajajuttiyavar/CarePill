import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import { api } from "../api";

export default function Layout() {
  const [familyName, setFamilyName] = useState("");

  useEffect(() => {
    api.getFamily().then((data) => setFamilyName(data.family?.family_name)).catch(() => { });
  }, []);

  return (
    <div className="flex min-h-screen bg-blush">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <TopBar familyName={familyName} />
        <div className="page-content-wrapper flex-1 w-full pb-8 min-h-[calc(100vh-70px)]">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
