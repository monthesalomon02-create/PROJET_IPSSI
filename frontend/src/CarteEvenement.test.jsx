import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CarteEvenement from "./CarteEvenement";

function rendreCarte(evenement) {
  return render(
    <MemoryRouter>
      <CarteEvenement evenement={evenement} />
    </MemoryRouter>,
  );
}

const evenementDeBase = {
  id: 1,
  titre: "Conférence de test",
  description: "Une description de test",
  date_debut: "2027-06-15 18:00",
  lieu: "Lyon",
  prix: "0",
  capacite_max: 10,
  inscrits: 3,
  places_restantes: 7,
  complet: false,
  categorie: { id: 1, nom: "Conférence" },
};

describe("CarteEvenement", () => {
  it("affiche le titre, le lieu et le badge Gratuit", () => {
    rendreCarte(evenementDeBase);

    expect(screen.getByText("Conférence de test")).toBeInTheDocument();
    expect(screen.getByText(/Lyon/)).toBeInTheDocument();
    expect(screen.getByText("Gratuit")).toBeInTheDocument();
  });

  it("affiche le prix quand l'évènement n'est pas gratuit", () => {
    rendreCarte({ ...evenementDeBase, prix: "15" });

    expect(screen.getByText("15 €")).toBeInTheDocument();
  });

  it("affiche le badge Complet quand l'évènement est plein", () => {
    rendreCarte({ ...evenementDeBase, complet: true, places_restantes: 0 });

    // "Complet" apparaît à la fois en badge et dans la jauge de capacité
    expect(screen.getAllByText("Complet").length).toBeGreaterThan(0);
  });
});
