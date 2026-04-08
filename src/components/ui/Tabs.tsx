'use client';

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, defaultTabId, onChange }, ref) => {
    const [activeTabId, setActiveTabId] = useState(
      defaultTabId || tabs[0]?.id || ''
    );

    const handleTabChange = (tabId: string) => {
      setActiveTabId(tabId);
      onChange?.(tabId);
    };

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    return (
      <div ref={ref} className="w-full">
        <div className="border-b border-lw-border">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-1 py-4 font-body font-medium text-base whitespace-nowrap transition-colors duration-200 ${
                  activeTabId === tab.id
                    ? 'text-lw-blue-deep'
                    : 'text-lw-warm-gray hover:text-lw-charcoal'
                }`}
              >
                {tab.label}
                {activeTabId === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-lw-gold rounded-t-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6 animate-fade-in">
          {activeTab && activeTab.content}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export default Tabs;
