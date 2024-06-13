/**
 * Validates if the provided service name is valid based on BRC-87 guidelines.
 * @param serviceName - The service name to validate.
 * @returns True if the service name is valid, false otherwise.
 */
export const isValidServiceName = (serviceName: string): boolean => {
  const serviceNameRegex = /^(?!_)(?!.*__)[a-z_]{1,50}(?<!_)$/
  return serviceNameRegex.test(serviceName)
}
