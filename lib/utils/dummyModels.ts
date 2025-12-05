export function dummyUser(id?: string): { id: string; name: string; email: string } {
  return {
    id: id || `user_${Math.random().toString(36).substring(2, 15)}`,
    name: 'x'.repeat(8),
    email: `user_${Math.random().toString(36).substring(7)}@test.com`,
  };
}

export function dummyProduct(id?: string): { id: string; name: string; price: number } {
  return {
    id: id || `product_${Math.random().toString(36).substring(2, 15)}`,
    name: 'x'.repeat(10),
    price: Math.floor(Math.random() * 1000) + 10,
  };
}

export function dummyPost(id?: string): { id: string; title: string; content: string } {
  return {
    id: id || `post_${Math.random().toString(36).substring(2, 15)}`,
    title: 'x'.repeat(15),
    content: 'x'.repeat(50),
  };
}
