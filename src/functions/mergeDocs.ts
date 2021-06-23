import moment from "moment";

/* Import types */
import type { Song } from "../types/Song";

/**
 * Merge and sort docs.
 * @param firstArray Song[]
 * @param secondArray Song[]
 */
export default function mergeDocs(
  firstArray: Song[],
  secondArray: Song[]
): Song[] {
  return [...firstArray, ...secondArray].sort((a, b) => {
    const dateA = moment(a.date, "DD.MM.YYYY").unix();
    const dateB = moment(b.date, "DD.MM.YYYY").unix();

    return dateA - dateB;
  });
}
