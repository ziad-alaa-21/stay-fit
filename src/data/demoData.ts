import { Database, Product, Customer, Order, NotificationItem } from "../types";
import { categories, paymentMethods, statuses, productStatuses, dbKey } from "../utils/constants";
import { uid, daysAgo, nowIso } from "../utils/helpers";

export function generateDemoData(): Database {
  const first = ["Omar", "Mariam", "Youssef", "Nour", "Ahmed", "Farida", "Karim", "Laila", "Hassan", "Salma", "Mazen", "Dina"];
  const last = ["Hassan", "Adel", "Mahmoud", "Nabil", "Fouad", "Samir", "Ibrahim", "Khaled", "Mostafa", "Yehia"];
  const flavors = ["Chocolate Spread", "Strawberry Rush", "Cosmic Candy", "Vanilla Forge", "Blue Raspberry", "Banana Cream", "Energy Drink"];
  const weights = ["300g", "500g", "1kg", "2kg", "5kg"];
  
  const products: Product[] = Array.from({ length: 50 }, (_, index) => {
    const category = categories[index % 7];
    const flavor = flavors[(index * 3) % flavors.length];
    const base = category === "Whey Protein" ? 2400 : category === "Mass Gainer" ? 2900 : category === "Creatine" ? 950 : 1200;
    const low = index < 10 ? Math.floor(Math.random() * 9) : Math.floor(10 + Math.random() * 120);
    return {
      id: uid("prd"),
      name: `STAY FIT ${category.toUpperCase()} - ${flavor}`,
      sku: `SF-${category.slice(0, 3).toUpperCase()}-${1000 + index}`,
      category,
      description: `Premium ${category.toLowerCase()} built for intense training blocks.`,
      price: base + (index % 5) * 120,
      compareAtPrice: base + 450,
      costPerItem: Math.round(base * 0.52),
      stock: low,
      lowStockThreshold: 10,
      status: index % 12 === 0 ? "archived" : index % 7 === 0 ? "draft" : "active",
      flavor: [flavor],
      weight: weights[index % weights.length],
      salesCount: 20 + ((index * 17) % 260),
      createdAt: daysAgo(120 - index),
      updatedAt: daysAgo(index % 20),
    };
  });

  const customers: Customer[] = Array.from({ length: 80 }, (_, index) => {
    const name = `${first[index % first.length]} ${last[(index * 2) % last.length]}`;
    return {
      id: uid("cus"),
      name,
      email: `${name.toLowerCase().replace(" ", ".")}${index}@stayfit.test`,
      phone: `+20 10${Math.floor(10000000 + Math.random() * 89999999)}`,
      address: `${12 + index} Gym Street, New Cairo, Egypt`,
      totalOrders: 0,
      totalSpent: 0,
      joinDate: daysAgo(180 - (index % 90)),
      notes: index % 8 === 0 ? "Prefers phone confirmation before shipping." : "",
    };
  });

  const orders: Order[] = Array.from({ length: 200 }, (_, index) => {
    const customer = customers[index % customers.length];
    const itemCount = 1 + (index % 4);
    const items = Array.from({ length: itemCount }, (_, itemIndex) => {
      const product = products[(index * 5 + itemIndex * 7) % products.length];
      const quantity = 1 + ((index + itemIndex) % 3);
      return { 
        productId: product.id, 
        productName: product.name, 
        quantity, 
        unitPrice: product.price, 
        total: product.price * quantity 
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingCost = subtotal > 2500 ? 0 : 85;
    return {
      id: `SF-${new Date().getFullYear()}-${String(10000 + index)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: customer.address,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: statuses[index % statuses.length],
      paymentMethod: paymentMethods[index % paymentMethods.length],
      createdAt: daysAgo(index % 90),
      updatedAt: daysAgo(index % 30),
    };
  });

  orders.forEach((order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    if (customer && order.status !== "cancelled" && order.status !== "refunded") {
      customer.totalOrders += 1;
      customer.totalSpent += order.total;
    }
  });

  const notifications: NotificationItem[] = [
    ...orders.slice(0, 6).map((order) => ({ 
      id: uid("not"), 
      kind: "order" as const, 
      title: "Recent order", 
      body: `${order.id} from ${order.customerName}`, 
      read: false, 
      createdAt: order.createdAt 
    })),
    ...products.filter((p) => p.stock < p.lowStockThreshold).slice(0, 8).map((p) => ({ 
      id: uid("not"), 
      kind: "stock" as const, 
      title: "Low stock alert", 
      body: `${p.name} has ${p.stock} units left`, 
      read: false, 
      createdAt: nowIso() 
    })),
    ...customers.slice(0, 4).map((c) => ({ 
      id: uid("not"), 
      kind: "customer" as const, 
      title: "New customer", 
      body: `${c.name} joined STAY FIT`, 
      read: true, 
      createdAt: c.joinDate 
    })),
  ];

  return {
    products,
    orders,
    customers,
    stockAdjustments: [],
    notifications,
    settings: {
      storeName: "STAY FIT",
      currency: "EGP",
      contactEmail: "admin@stayfit.eg",
      phone: "+20 100 000 0000",
      adminName: "STAY FIT Admin",
      adminEmail: "owner@stayfit.eg",
      password: "demo-password",
    },
  };
}
