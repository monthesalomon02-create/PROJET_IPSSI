import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PageLogin from "./PageLogin";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("PageLogin (parcours de connexion)", () => {
  it("appelle onConnexion avec le token après une connexion réussie", async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ token: "jwt-de-test" }),
    });
    const onConnexion = vi.fn();

    render(<PageLogin onConnexion={onConnexion} />);

    fireEvent.change(screen.getByPlaceholderText("vous@exemple.com"), {
      target: { value: "test@exemple.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "motdepasse123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() =>
      expect(onConnexion).toHaveBeenCalledWith("jwt-de-test"),
    );
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("affiche un message d'erreur si les identifiants sont invalides", async () => {
    apiFetch.mockResolvedValue({ ok: false, json: async () => ({}) });

    render(<PageLogin onConnexion={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("vous@exemple.com"), {
      target: { value: "test@exemple.fr" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "mauvais" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByText("Email ou mot de passe incorrect"),
    ).toBeInTheDocument();
  });
});
