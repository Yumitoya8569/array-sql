# Typescript Array SQL
Typescript library help you manipulate array with SQL-like syntax (completely type support)

## Quickstart

### Install
```
npm i "@yumitoya8569/ts-array-sql"
```

### Import
```
import { ArraySQL, SortDir } from '@yumitoya8569/ts-array-sql';
```

## Example

### Init Table
```typescript
import { ArraySQL, SortDir } from '@yumitoya8569/ts-array-sql';

type Customer = {
    c_id: string,
    name: string,
    city: string,
    address: string,
    phone: string,
    salary: number
};
type Order = {
    o_id: string,
    order_no: string,
    c_id: string,
    price: number
};

const customers: Customer[] = [ /* your data here */];
const orders: Order[] = [/* your data here */];
```

### With SQL
```sql
  SELECT a.name, SUM(b.price) sum_price
  FROM customers a
  LEFT JOIN orders b
  ON a.c_id = b.c_id
  GROUP BY a.c_id
  ORDER BY a.c_id ASC
```

### With ArraySQL
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
