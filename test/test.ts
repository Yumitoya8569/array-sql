import { ArraySQL, SortDir } from "../src/ts-array-sql";
import { customers, employees, orders } from "./table";


/*
  SELECT a.name, a.phone
  FROM customers a
*/
const test1 = ArraySQL
  .from({ a: customers })
  .select(({ a }) => ({ name: a.name, phone: a.phone }));

console.log(test1);

/*
  SELECT *
  FROM customers a
  WHERE a.city = 'Taipei' AND a.salary >= 20000
*/
const test2 = ArraySQL
  .from({ a: customers })
  .where(({ a }) => a.city === 'Taipei' && a.salary >= 20000)
  .select(({ a }) => ({ ...a }));

console.log(test2);


/*
  SELECT *
  FROM employees a
  ORDER BY a.title ASC, a.name DESC
*/
const test3 = ArraySQL
  .from({ a: employees })
  .orderBy(({ a }) => [a.title, a.name], [SortDir.ASC, SortDir.DESC])
  .select(({ a }) => ({ ...a }));

console.log(test3);

/*
  SELECT a.name, b.order_no
  FROM customers a
  JOIN orders b ON a.c_id=b.c_id
*/
const test4 = ArraySQL
  .from({ a: customers })
  .join({ b: orders }).on(({ a, b }) => a.c_id === b.c_id)
  .select(({ a, b }) => ({ name: a.name, order_no: b.order_no }));

console.log(test4);


/*
  SELECT a.name, b.order_no
  FROM customers a
  LEFT JOIN orders b ON a.c_id=b.c_id
*/
const test5 = ArraySQL
  .from({ a: customers })
  .leftJoin({ b: orders }).on(({ a, b }) => a.c_id === b.c_id)
  .select(({ a, b }) => ({ name: a.name, order_no: b.order_no }));

console.log(test5);


/*
  SELECT a.name, b.order_no
  FROM customers a
  RIGHT JOIN orders b ON a.c_id=b.c_id
*/
const test6 = ArraySQL
  .from({ a: customers })
  .rightJoin({ b: orders }).on(({ a, b }) => a.c_id === b.c_id)
  .select(({ a, b }) => ({ name: a.name, order_no: b.order_no }));

console.log(test6);


/*
  SELECT a.name, SUM(b.price) sum_price
  FROM customers a
  LEFT JOIN orders b ON a.c_id=b.c_id
  GROUP BY a.c_id
  ORDER BY a.c_id ASC
*/

const test7 = ArraySQL
  .from({ a: customers })
  .leftJoin({ b: orders }).on(({ a, b }) => a.c_id === b.c_id)
  .groupBy(({ a }) => [a.c_id])
  .orderBy(({ a }) => [a.c_id], [SortDir.ASC])
  .select(({ a }, gp) => ({
    name: a.name,
    sum_price: gp?.sum(({ b }) => b.price)
  }));

console.log(test7);