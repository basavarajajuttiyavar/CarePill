import React from "react";

export default function Placeholder({ title, description }) {
  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#2B1420]">{title}</h1>
      <p className="text-[13px] text-[#8A6A75] mt-1">{description}</p>
      <div className="mt-6 bg-white border border-dashed border-[#EAD3DA] rounded-2xl p-10 text-center text-[13px] text-[#B58C97]">
        Wire this screen up to the matching API endpoint the same way the pages in src/pages/ do.
      </div>
    </div>
  );
}
