const { forceArray, uniq } = require('../utils')

module.exports = claims => {
  if (!claims) return []

  const claimsProperties = Object.keys(claims)

  const subSnaksProperties = []

  const addSnaksProperties = snaks => {
    const properties = Object.keys(snaks)
    subSnaksProperties.push(...properties)
  }

  claimsProperties.forEach(addPropertyClaimsSnaksProperties(claims, addSnaksProperties))

  return uniq(claimsProperties.concat(subSnaksProperties))
}

const addPropertyClaimsSnaksProperties = (claims, addSnaksProperties) => claimProperty => {
  const propertyClaims = claims[claimProperty]
  forceArray(propertyClaims).forEach(claim => {
    const { qualifiers, references } = claim
    if (qualifiers) addSnaksProperties(qualifiers)
    if (references) forceArray(references).forEach(addSnaksProperties)
  })
}
