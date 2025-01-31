type Envs = {
  isDev: boolean
  isStaging: boolean
  isProd: boolean
}

const getRegex = (regex: string | undefined): RegExp | undefined => (regex ? new RegExp(regex) : undefined)

function checkEnvironment(host: string): Envs {
  const domainDevRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_DEV)
  const domainStagingRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_STAGING)
  const domainProdRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_PROD)

  return {
    isDev: domainDevRegex?.test(host) || false,
    isStaging: domainStagingRegex?.test(host) || false,
    isProd: domainProdRegex?.test(host) || false,
  }
}

const { isDev, isStaging, isProd } = checkEnvironment(window.location.host)

export const environmentName = (function (): 'production' | 'staging' | 'development' | undefined {
  if (isProd) {
    return 'production'
  } else if (isStaging) {
    return 'staging'
  } else if (isDev) {
    return 'development'
  } else {
    return undefined
  }
})()

export { isDev, isStaging, isProd }
