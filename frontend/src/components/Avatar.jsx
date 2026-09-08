import React from "react";

const PALETTE = ["#C0395A", "#B4306E", "#D9536E", "#8E2A50", "#A83A5E"];

function colorFor(name) {
  const index = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[index];
}

export default function Avatar({ name, size = 40, accent }) {
  const initials = (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: accent || colorFor(name || "") }}
    >
      {initials}
    </div>
  );
}
