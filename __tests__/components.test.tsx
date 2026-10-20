import React from "react";
import { render, screen } from "@testing-library/react";
import CodeBlock from "@/components/CodeBlock";
import { LoaderOverlay } from "@/components/Loader";

describe("Base UI Components", () => {
  describe("CodeBlock", () => {
    it("renders code string in preformatted block", () => {
      render(<CodeBlock code="const a = 10;" />);
      expect(screen.getByText("const a = 10;")).toBeInTheDocument();
    });
  });

  describe("LoaderOverlay", () => {
    it("renders fixed backdrop container with custom class", () => {
      const { container } = render(<LoaderOverlay className="custom-loader" />);
      expect(container.firstChild).toHaveClass("fixed");
      expect(container.firstChild).toHaveClass("custom-loader");
    });
  });
});
