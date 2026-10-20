import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/partials/Footer";

describe("Footer Component", () => {
  it("renders about description, creators, and quick links", () => {
    render(<Footer />);

    expect(screen.getByText(/About \| bideo/i)).toBeInTheDocument();
    expect(screen.getByText("Ayushmaan Aggarwal")).toBeInTheDocument();
    expect(screen.getByText("Rajit Kuthiala")).toBeInTheDocument();
    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    expect(screen.getByText("Contribute")).toBeInTheDocument();
  });

  it("displays copyright with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear} bideo \\| MIT License`, "i"))
    ).toBeInTheDocument();
  });
});
