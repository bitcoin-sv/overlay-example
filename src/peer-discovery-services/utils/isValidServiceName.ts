/**
 * Validates if the provided service name is valid based on BRC-87 guidelines.
 * @param service - The service name to validate.
 * @returns True if the service name is valid, false otherwise.
 */
export const isValidServiceName = (service: string): boolean => {
  const serviceRegex = /^(?!_)(?!.*__)[a-z_]{1,50}(?<!_)$/
  return serviceRegex.test(service)
}
