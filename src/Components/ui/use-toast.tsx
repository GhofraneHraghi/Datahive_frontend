export const toast = ({ title, description, variant }) => {
  alert(`${title}\n${description || ""}`);
};