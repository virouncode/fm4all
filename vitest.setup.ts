// Matchers DOM (toBeInTheDocument, …) branchés sur l'`expect` de Vitest.
// L'entrée générique "@testing-library/jest-dom" suppose un `expect` global
// (globals: true) et plante sinon : « expect is not defined ».
import "@testing-library/jest-dom/vitest";
