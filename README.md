# ts-array-sql

Manipulate typescript arrays with SQL-like syntax

### Install
```
npm i @toya/ts-array-sql
```

### Import
```
import { ArraySQL, SortDir } from '@toya/ts-array-sql';
```

## Example
```typescript
/*
  SELECT a.name, SUM(Price) sum_price
  FROM customers a
  LEFT JOIN orders b ON a.c_id=b.c_id
  GROUP BY a.c_id
  ORDER BY a.c_id ASC
*/

const result = ArraySQL
  .from({ a: customers })
  .leftJoin({ b: orders }).on(({ a, b }) => a.c_id === b.c_id)
  .groupBy(({ a }) => [a.c_id])
  .orderBy(({ a }) => [a.c_id], [SortDir.ASC])
  .select(({ a }, gp) => ({
    name: a.name,
    sum_price: gp?.sum(({ b }) => b.price)
  }));
```
