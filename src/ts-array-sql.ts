export type Soruce = { [key: string]: any[] };
export type Item<S> = S extends { [K in keyof S]: (infer I)[] } ? I : never;
export const GROUP_SEPERATOR = "___";

export enum SortDir {
    ASC,
    DESC
}

export enum JoinMode {
    INNER,
    LEFT,
    RIGHT,
    FULL,
    CROSS
}

export interface SelectBuilder<T> {
    select<R>(selectFn: (item: T, group: SQLGroup<T> | null, index: number) => R,): R[]
}

export interface OrderBuilder<T> extends SelectBuilder<T> {
    orderBy(getDataFn: (item: T, group: SQLGroup<T> | null) => any[], modes?: SortDir[]): SelectBuilder<T>
}

export interface GroupBuilder<T> extends OrderBuilder<T>, SelectBuilder<T> {
    groupBy(getDataFn: (item: T) => any[]): HavingBuilder<T>
}

export interface HavingBuilder<T> extends OrderBuilder<T>, SelectBuilder<T> {
    having(havingFn: (group: SQLGroup<T>) => boolean): OrderBuilder<T>
}

export class ArraySQL {

    static compareFn(a: any, b: any, mode: SortDir) {
        if (mode === SortDir.ASC) {
            return a < b ? -1 : a > b ? 1 : 0;
        } else {
            return a < b ? 1 : a > b ? -1 : 0;
        }
    }

    static from<S extends Soruce>(soruce: S) {
        const newTable = new SQLTable(soruce);
        const newList = newTable.toList();
        const result = new TmpResult([newTable], newList);
        return new SQLBuilder(result);
    }
}

export class SQLBuilder<T> {


    constructor(private result: TmpResult<T>) {
    }

    join<S extends Soruce>(newSoruce: S, joinMode = JoinMode.INNER) {

        return {
            on: (onFn: (item: T & { [K in keyof S]: Item<S> }) => boolean) => {
                const newTable = new SQLTable(newSoruce);
                const newList: (T & { [K in keyof S]: Item<S> })[] = [];
                let listA: Array<any> = this.result.list;
                let listB: Array<any> = newTable.toList();

                if (joinMode === JoinMode.RIGHT) {
                    const tmpList = listA;
                    listA = listB;
                    listB = tmpList;
                }

                listA.forEach((itemA) => {
                    const oldLen = newList.length;

                    listB.reduce((val, itemB) => {
                        const joinItem = { ...itemA, ...itemB };

                        if (onFn(joinItem)) {
                            val.push(joinItem);
                        }

                        return val;
                    }, newList);

                    if (oldLen === newList.length && joinMode === JoinMode.LEFT) {
                        const nullItem = { [newTable.alias]: {} };
                        newList.push({ ...itemA, ...nullItem });

                    } else if (oldLen === newList.length && joinMode === JoinMode.RIGHT) {
                        const nullItem = this.result.tables
                            .map(t => t.alias)
                            .reduce((val, key) => {
                                val[key] = {};
                                return val;
                            }, {} as any);
                        newList.push({ ...itemA, ...nullItem });
                    }
                });

                const newResult = new TmpResult([...this.result.tables, newTable], newList);
                return new SQLBuilder(newResult);
            }
        }
    }

    leftJoin<S extends Soruce>(newSoruce: S) {
        return this.join(newSoruce, JoinMode.LEFT);
    }

    rightJoin<S extends Soruce>(newSoruce: S) {
        return this.join(newSoruce, JoinMode.RIGHT);
    }

    where(whereFn: (item: T) => boolean) {
        const newList = this.result.list.filter((item) => whereFn(item));
        const newResult = new TmpResult(this.result.tables, newList);
        return new SQLBuilder(newResult) as GroupBuilder<T>;
    }

    groupBy(getDataFn: (item: T) => any[]) {
        const map = new Map<string, SQLGroup<T>>();

        this.result.list.forEach((itemA) => {
            const key = getDataFn(itemA).join(GROUP_SEPERATOR);
            const group = map.get(key) ?? new SQLGroup(key);
            group.list.push(itemA);
            map.set(key, group);
        });

        const newGroupList = Array.from(map, ([key, val]) => val);
        const newResult = new TmpResult(this.result.tables, this.result.list, newGroupList);
        return new SQLBuilder(newResult) as HavingBuilder<T>;
    }

    having(havingFn: (group: SQLGroup<T>) => boolean) {
        const newGroupList = this.result.groupList?.filter((g) => havingFn(g));
        const newResult = new TmpResult(this.result.tables, this.result.list, newGroupList);
        return new SQLBuilder(newResult) as OrderBuilder<T>;
    }

    orderBy(getDataFn: (item: T, group: SQLGroup<T> | null) => any[], modes: SortDir[] = []) {

        if (this.result.groupList) {
            this.result.groupList.sort((groupA, groupB) => {
                const dataA = getDataFn(groupA.list[0], groupA);
                const dataB = getDataFn(groupB.list[0], groupB);

                let i = 0;
                while (i < dataA.length) {
                    const mode = modes[i] ?? SortDir.ASC;
                    const compare = ArraySQL.compareFn(dataA[i], dataB[i], mode);
                    if (compare !== 0) { return compare; }
                    i++;
                }
                return 0;
            });
        } else {
            this.result.list.sort((itemA, itemB) => {
                const dataA = getDataFn(itemA, null);
                const dataB = getDataFn(itemB, null);

                let i = 0;
                while (i < dataA.length) {
                    const mode = modes[i] ?? SortDir.ASC;
                    const compare = ArraySQL.compareFn(dataA[i], dataB[i], mode);
                    if (compare !== 0) { return compare; }
                    i++;
                }
                return 0;
            });
        }

        return this as SelectBuilder<T>
    }

    select<R>(selectFn: (item: T, group: SQLGroup<T> | null, index: number) => R) {
        if (this.result.groupList) {
            return this.result.groupList.map((g, i) => selectFn(g.list[0], g, i));
        } else {
            return this.result.list.map((val, i) => selectFn(val, null, i));
        }
    }
}

export class SQLGroup<T> {

    constructor(
        public readonly key: string,
        public readonly list: Array<T> = []) {
    }

    count(getDataFn?: (item: T) => any) {
        if (getDataFn) {
            return this.list.reduce((num, itemA) => getDataFn(itemA) === null ? num : ++num, 0);
        } else {
            return this.list.length;
        }
    }

    countDistinct(getDataFn: (item: T) => any) {
        return new Set(this.list.map((itemA) => getDataFn(itemA)).filter(itemA => itemA !== null)).size;

    }

    max(getDataFn: (item: T) => any) {
        const max = this.list.reduce((curr, itemA) => {
            const dataA = getDataFn(itemA);
            const isAsc = ArraySQL.compareFn(curr, dataA, SortDir.ASC);
            return isAsc <= 0 ? dataA : curr;
        }, null);

        return max;
    }

    min(getDataFn: (item: T) => any) {
        const min = this.list.reduce((curr, itemA) => {
            const dataA = getDataFn(itemA);
            const isAsc = ArraySQL.compareFn(curr, dataA, SortDir.ASC);
            return isAsc >= 0 ? dataA : curr;
        }, null);

        return min;
    }

    sum(getDataFn: (item: T) => number) {
        return this.list.reduce((num, itemA) => num + (getDataFn(itemA) ?? 0), 0);
    }

    avg(getDataFn: (item: T) => number) {
        const sum = this.sum(getDataFn);
        const avg = (sum / this.list.length) || 0;
        return avg;
    }
}

export class SQLTable<S extends Soruce, I extends Item<S>> {
    public readonly alias: (keyof S);

    constructor(
        public readonly source: S,
        public readonly columns?: (keyof I)[]
    ) {

        this.alias = Object.keys(this.source)[0] as (keyof S);

        if (!this.columns) {
            if (this.source[this.alias].length === 0) {
                this.columns = [];
                console.warn('Please specify the column manually, column cannot be inferred on', this);
            } else {
                this.columns = Object.keys(this.source[this.alias][0]) as (keyof I)[];
            }
        }
    }

    toList() {
        return this.source[this.alias].map(i => ({ [this.alias]: i } as { [K in keyof S]: I }));
    }
}

export class TmpResult<T> {

    constructor(
        public readonly tables: SQLTable<any, any>[] = [],
        public readonly list: T[],
        public readonly groupList?: SQLGroup<T>[]
    ) {
    }
}
