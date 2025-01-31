export const capitalize = (
  input: string | null | undefined,
  capitalizeAll = true
) => {
  if (!input?.trim()) return "";
  input = input.trim();
  if (capitalizeAll) {
    return input
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("-")
      )
      .join(" ");
  } else {
    const [firstWord, ...rest] = input.split(" ");
    return [
      firstWord
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-"),
      ...rest.join(" "),
    ].join(" ");
  }
};
