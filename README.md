# ts-array-sql
Help you manipulate typescript arrays with SQL-like syntax and completely type support

### Install
```
npm i "@yumitoya8569/ts-array-sql"
```

### Import
```
import { ArraySQL, SortDir } from '@yumitoya8569/ts-array-sql';
```

## Example
```sql
  SELECT a.name, SUM(b.price) sum_price
  FROM customers a
  LEFT JOIN orders b
  ON a.c_id = b.c_id
  GROUP BY a.c_id
  ORDER BY a.c_id ASC
```

```typescript

const result = ArraySQL
  .from({ a: customers })
  .leftJoin({ b: orders })
  .on(({ a, b }) => a.c_id === b.c_id)
  .groupBy(({ a }) => [a.c_id])
  .orderBy(({ a }) => [a.c_id], [SortDir.ASC])
  .select(({ a }, gp) => ({
      name: a.name,
      sum_price: gp?.sum(({ b }) => b.price)
  }));
```
