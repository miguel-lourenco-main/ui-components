/**
 * Generates a dummy user object with an id, name, and email.
 * @returns {Object} The dummy user object containing id, name, and email.
 */
export function dummyUser(id?: string): { id: string; name: string; email: string } {
  /**
 * Generates a dummy user object with an id, name, and email.
 * @returns {Object} An object representing a dummy user with properties: id, name, and email.
 */
  return {
    id: id || `user_${Math.random().toString(36).substring(2, 15)}`,
    name: 'x'.repeat(8),
    email: `user_${Math.random().toString(36).substring(7)}@test.com`,
  };
/**
 * Generates a dummy product object with an id, name, and price.
 * @returns {Object} The dummy product object containing id, name, and price.
 /**
 * Generates a dummy product object with an id, name, and price.
 * @returns {Object} An object containing the id, name, and price of the product.
 /**
 * Generates a dummy product object with an id, name, and price.
 * @returns {Object} An object representing a dummy product with properties: id, name, and price.
 */
 /**
 * Generates a dummy product object with an id, name, and price.
 /**
 * Generates a dummy product object with an id, name, and price.
 * @returns {Object} A product object containing id, name, and price.
 */
 * @returns {Object} An object representing a dummy product.
 /** * Generates a dummy product object with an id, name, and price. * @returns {Object} A dummy product object containing id, name, and price. */
 */
 */
 */
}

export function dummyProduct(id?: string): { id: string; name: string; price: number } {
  return {
    id: id || `product_${Math.random().toString(36).substring(2, 15)}`,
    /**
 * Generates a dummy post object with an id, title, and content.
 /** * Generates a dummy post object with an id, title, and content. * @returns {Object} A dummy post object containing id, title, and content. */
 /**
 * Generates a dummy post object with an id, title, and content.
 * @returns {Object} A post object containing id, title, and content.
 */
 /**
 * Generates a dummy post object with properties: id, title, and content.
 *
 * @returns {Object} The dummy post object.
 */

 * @returns {Object} An object representing a dummy post with properties: id, title, and content.
 */
    name: 'x'.repeat(10),
    /**
 * Generates a dummy post object with an id, title, and content.
 * @returns {Object} The dummy post object containing id, title, and content.
 */
    price: Math.floor(Math.random() * 1000) + 10,
  };
/**
 * Generates a dummy post object with an id, title, and content.
 *
 * @returns {Object} An object representing a dummy post containing an id, title, and content.
 */
}

export function dummyPost(id?: string): { id: string; title: string; content: string } {
  return {
    id: id || `post_${Math.random().toString(36).substring(2, 15)}`,
    title: 'x'.repeat(15),
    content: 'x'.repeat(50),
  };
}
