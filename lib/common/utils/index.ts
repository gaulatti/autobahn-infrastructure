const camelToKebab = (str: string) => str.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase();

const kebabToCamel = (str: string) => {
  return str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
};

const capitalize = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export { camelToKebab, kebabToCamel, capitalize };
