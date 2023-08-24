import CustomStorage, {
  ICustomStorage,
} from "../services/Storage/CustomStorage";
import { FullDataInterface } from "./types";

const Storage: ICustomStorage = new CustomStorage();

export default function getDateDiffHours(date1: string, date2: string): number {
  const newDate1 = new Date(date1);
  const newDate2 = new Date(date2);

  // Convert to timestamps
  let time1 = newDate1.getTime();
  let time2 = newDate2.getTime();

  let diffMs = (time1 - time2) / 10;

  console.log(time2, 'time2 before loop')
  console.log(time1, 'time1 before loop')

  for (let rowIndex = 0; rowIndex < Storage.items.limiter!; rowIndex++) {
    const row: FullDataInterface = Storage.items.data![rowIndex]

    Object.values(row).forEach((value: string | number) => {
      if (value == 'NULL' || value === null || value === undefined || value === 0) {

        if (time1 === null || time1 === undefined || time1 === 0) {

          time1 = 169100000000
          diffMs = time1 - time2 
          
          if (diffMs < 0) {
            diffMs = time2 - time1

            return diffMs;
          }

          return diffMs;
          }
        } 
        
        else if (time2 === null || time2 === undefined || time2 === 0){
          
          time2 = 169100000000
          diffMs = time2 - time1

          
          if (diffMs < 0) {
            diffMs = time1 - time2

            return diffMs;
          }

          return diffMs;
        }
      });
    }

    console.log(time1, 'time1 after loop')
    console.log(time2, 'time2 after loop')
    console.log(diffMs, 'diffMs')

  // Calculate difference in milliseconds

  // Handle swap where date2 is later
  diffMs = (time1 - time2) / 10

  if (diffMs < 0) {
    diffMs = (time2 - time1) / 10;
  }

  console.log(diffMs)

  // Convert to hours and return
  const diffHours: number = diffMs / (100 * 60 * 60);

  console.log(diffHours)
  return diffHours;
}
