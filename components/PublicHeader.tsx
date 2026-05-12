"use client";

import { LocaleSwitcher } from "./LocaleSwitcher";

export function PublicHeader() {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 sm:p-6">
      <LocaleSwitcher />
    </div>
  );
}
