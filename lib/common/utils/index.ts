/**
 * Converts a camelCase string to kebab-case.
 *
 * @param str - The camelCase string to convert.
 * @returns The kebab-case representation of the input string.
 */
const camelToKebab = (str: string) => str.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param str - The kebab-case string to convert.
 * @returns The camelCase version of the input string.
 */
const kebabToCamel = (str: string) => {
  return str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
const capitalize = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Checks if the event is a warmup event.
 *
 * @param event - The event object to check.
 * @returns True if the event is a warmup event, false otherwise.
 */
const isWarmup = (event: any) => event.source === 'cdk.schedule' && event.action === 'warmup';

export { camelToKebab, kebabToCamel, capitalize, isWarmup };
