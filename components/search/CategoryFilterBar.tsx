"use client";

import React from "react";
import { VideoCategory } from "@/types/video";

export const ALL_CATEGORIES: { label: string; value: VideoCategory }[] = [
  { label: "Technology", value: "TECH" },
  { label: "Education", value: "EDUCATION" },
  { label: "Gaming", value: "GAMING" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Music", value: "MUSIC" },
  { label: "News", value: "NEWS" },
  { label: "Sports", value: "SPORTS" },
  { label: "Lifestyle", value: "LIFESTYLE" },
  { label: "Other", value: "OTHER" },
];

interface Props {
  selectedCategories: VideoCategory[];
  onChange: (categories: VideoCategory[]) => void;
  className?: string;
}

export const CategoryFilterBar: React.FC<Props> = ({
  selectedCategories,
  onChange,
  className = "",
}) => {
  const isAllSelected = selectedCategories.length === 0;

  const toggleCategory = (category: VideoCategory) => {
    if (selectedCategories.includes(category)) {
      // Remove from selection
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      // Add to selection
      onChange([...selectedCategories, category]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div
      className={`w-full max-w-full min-w-0 flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth ${className}`}
      role="region"
      aria-label="Category Filters"
    >
      {/* "All" Button */}
      <button
        type="button"
        onClick={handleClearAll}
        className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer border ${
          isAllSelected
            ? "bg-foreground text-background font-semibold border-foreground shadow-sm"
            : "bg-muted/70 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
        }`}
      >
        All
      </button>

      {/* Category Pills */}
      {ALL_CATEGORIES.map(({ label, value }) => {
        const isSelected = selectedCategories.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggleCategory(value)}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                : "bg-muted/70 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            }`}
            aria-pressed={isSelected}
          >
            {label}
            {isSelected && (
              <span
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary-foreground/20 text-[10px]"
                aria-hidden="true"
              >
                ✕
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
