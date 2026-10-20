import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CategoryFilterBar,
  ALL_CATEGORIES,
} from "@/components/search/CategoryFilterBar";
import { VideoCategory } from "@/types/video";

describe("CategoryFilterBar Component", () => {
  it("renders 'All' button and all available categories", () => {
    const mockOnChange = jest.fn();
    render(
      <CategoryFilterBar
        selectedCategories={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
    ALL_CATEGORIES.forEach(({ label }) => {
      expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
    });
  });

  it("toggles category on click and adds to selection", () => {
    const mockOnChange = jest.fn();
    render(
      <CategoryFilterBar
        selectedCategories={[]}
        onChange={mockOnChange}
      />
    );

    const techBtn = screen.getByRole("button", { name: /technology/i });
    fireEvent.click(techBtn);

    expect(mockOnChange).toHaveBeenCalledWith(["TECH"]);
  });

  it("removes category if already selected", () => {
    const mockOnChange = jest.fn();
    const selected: VideoCategory[] = ["TECH", "GAMING"];

    render(
      <CategoryFilterBar
        selectedCategories={selected}
        onChange={mockOnChange}
      />
    );

    const techBtn = screen.getByRole("button", { name: /technology/i });
    fireEvent.click(techBtn);

    expect(mockOnChange).toHaveBeenCalledWith(["GAMING"]);
  });

  it("clears all categories when 'All' button is clicked", () => {
    const mockOnChange = jest.fn();
    const selected: VideoCategory[] = ["EDUCATION", "MUSIC"];

    render(
      <CategoryFilterBar
        selectedCategories={selected}
        onChange={mockOnChange}
      />
    );

    const allBtn = screen.getByRole("button", { name: /^all$/i });
    fireEvent.click(allBtn);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
