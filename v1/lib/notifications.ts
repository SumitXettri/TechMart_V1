export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'order' | 'auction';
  title: string;
  body: string;
  date: string;
  read?: boolean;
};

export const notifications: Notification[] = [
  { id: 'n-001', type: 'order', title: 'Order shipped', body: 'Your order TM-100244 has been shipped.', date: '21/05/2026', read: false },
  { id: 'n-002', type: 'auction', title: 'Outbid', body: 'You were outbid on Sony A7 IV Body.', date: '22/05/2026', read: false },
  { id: 'n-003', type: 'info', title: 'New feature', body: 'TechMart live auctions are now in beta.', date: '20/05/2026', read: true },
];
