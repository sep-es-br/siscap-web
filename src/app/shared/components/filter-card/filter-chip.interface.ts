export type FilterChipType = 'base' | 'filter';

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  type: FilterChipType;
  removable: boolean;
  group?: string;
  valueId?: number;
  groupedChips?: FilterChip[];
}
