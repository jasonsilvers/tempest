/*eslint-disable */
// Ignore any for args because they can literally be any....
function withErrorHandling<T extends (...args: any[]) => any>(
  func: T
): (...funcArgs: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args): Promise<ReturnType<T>> => {
    try {
      return await func(...args);
    } catch (e) {
      throw new Error('There was an error making the request');
    }
  };
}
/*eslint-enable */

export { withErrorHandling };
