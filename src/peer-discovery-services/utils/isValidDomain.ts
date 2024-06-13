/**
 * Validates if the provided domain name is valid.
 * @param domainName - The domain name to validate.
 * @returns True if the domain name is valid, false otherwise.
 */
export const isValidDomain = (domainName: string): boolean => {
  // Simple regex to validate domain name
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/
  return domainRegex.test(domainName)
}
