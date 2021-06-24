/**
 * Check if passed parameter is URL or not.
 * @param string string
 */
export default function isUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
