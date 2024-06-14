/**
 * Validates if the provided domain name is valid.
 * @param domain - The domain name to validate.
 * @returns True if the domain name is valid, false otherwise.
 */
export const isValidDomain = (domain: string): boolean => {
  // Simple regex to validate domain name
  const domainRegex = /^(https?:\/\/)?((([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,})|localhost(:[0-9]+))(\/.*)?$/
  return domainRegex.test(domain)
}
