import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react ne se nettoie automatiquement entre les tests que si
// "globals: true" est actif ; on garde les imports explicites partout ailleurs,
// donc on branche le nettoyage ici manuellement.
afterEach(() => {
  cleanup();
});
