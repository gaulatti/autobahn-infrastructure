const camelToKebab = (str: string) => str.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase();

export { camelToKebab };
