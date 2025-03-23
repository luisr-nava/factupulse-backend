import {
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOperator,
} from 'typeorm';

export function buildDateRangeFilter(
  dateFrom?: number,
  dateTo?: number,
): FindOperator<Date> | undefined {
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setDate(to.getDate() + 1);
    return Between(from, to);
  }

  if (dateFrom) {
    const from = new Date(dateFrom);
    return MoreThanOrEqual(from);
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setDate(to.getDate() + 1);
    return LessThanOrEqual(to);
  }

  return undefined;
}
