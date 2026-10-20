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

  it("displays build commit badge linking to github commit", () => {
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = "584bd9a";
    process.env.NEXT_PUBLIC_BUILD_NUMBER = "42";

    render(<Footer />);

    expect(screen.getByText("build:")).toBeInTheDocument();
    expect(screen.getByText(/#42 • 584bd9a/i)).toBeInTheDocument();

    const commitLink = screen.getByRole("link", {
      name: /#42 • 584bd9a/i,
    });
    expect(commitLink).toHaveAttribute(
      "href",
      "https://github.com/rajitk13/bideo_ui/commit/584bd9a"
    );
  });
});
