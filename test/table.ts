export type Customer = {
    c_id: string,
    name: string,
    city: string,
    address: string,
    phone: string,
    salary: number
};

export type Order = {
    o_id: string,
    order_no: string,
    c_id: string,
    price: number
};

export type Employee = {
    e_id: string,
    name: string,
    title: string
};

export const customers: Customer[] = [
    {
        c_id: '1',
        name: 'Zhang',
        city: 'Taipei',
        address: 'XX-100',
        phone: '02-12345678',
        salary: 25000
    },
    {
        c_id: '2',
        name: 'Wang',
        city: 'Hsinchu',
        address: 'YY-200',
        phone: '03-12345678',
        salary: 30000
    },
    {
        c_id: '3',
        name: 'Lee',
        city: 'Kaohsiung',
        address: 'ZZ-300',
        phone: '07-12345678',
        salary: 30000
    },
    {
        c_id: '4',
        name: 'Chen',
        city: 'Taipei',
        address: 'AA-400',
        phone: '02-87654321',
        salary: 50000
    }
];

export const orders: Order[] = [
    {
        o_id: '1',
        order_no: '2572',
        c_id: '3',
        price: 1000
    },
    {
        o_id: '2',
        order_no: '7375',
        c_id: '3',
        price: 2000
    },
    {
        o_id: '3',
        order_no: '7520',
        c_id: '1',
        price: 500
    },
    {
        o_id: '4',
        order_no: '1054',
        c_id: '1',
        price: 1300
    },
    {
        o_id: '5',
        order_no: '1257',
        c_id: '5',
        price: 1800
    }
];

export const employees: Employee[] = [
    {
        e_id: '1',
        name: 'Allen',
        title: 'crew',
    },
    {
        e_id: '2',
        name: 'Tom',
        title: 'manager',
    },
    {
        e_id: '3',
        name: 'Chris',
        title: 'crew',
    },
    {
        e_id: '4',
        name: 'Bill',
        title: 'crew',
    }
];
