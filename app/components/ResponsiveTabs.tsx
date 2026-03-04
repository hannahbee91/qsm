"use client";

import { useState } from "react";
import React from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ResponsiveTabsProps {
  layoutClassName: string;
  tabs: TabItem[];
  defaultTabId?: string;
}

export function ResponsiveTabs({ layoutClassName, tabs, defaultTabId }: ResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0].id);

  return (
    <>
      <div className="mobile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={layoutClassName}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`responsive-tab-panel ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
}
