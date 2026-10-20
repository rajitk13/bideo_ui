import React from "react";
import { render, screen } from "@testing-library/react";
import ViewProfile from "@/components/user/ViewProfile";
import { useAuth } from "@/store/auth-context";

jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

describe("ViewProfile Component", () => {
  it("renders profile with user info", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        userId: "u123",
        user_name: "John Doe",
        user_email: "john@example.com",
        avatar_url: "/avatar.png",
      },
    });

    render(<ViewProfile />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit profile/i })
    ).toBeInTheDocument();
  });

  it("handles empty or missing user gracefully", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<ViewProfile />);

    expect(screen.getByText("Your Name")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});
