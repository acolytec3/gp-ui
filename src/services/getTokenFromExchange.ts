import { Erc20Api, TokenDetails, TokenList, ExchangeApi } from 'types'
import { getImageUrl, log, getToken } from 'utils'
import { getErc20Info } from './getErc20Info'

interface TokenFromErc20Params {
  tokenAddress: string
  tokenId: number
  erc20Api: Erc20Api
}

async function getTokenFromErc20(params: TokenFromErc20Params): Promise<TokenDetails | null> {
  const { tokenAddress, tokenId, erc20Api } = params

  // Get base info from the ERC20 contract
  const erc20Info = await getErc20Info({ address: tokenAddress, erc20Api })
  if (!erc20Info) {
    log('Could not get details for token token (%s)', tokenAddress)
    return null
  }

  const token = {
    ...erc20Info,
    id: tokenId,
    address: tokenAddress,
    image: getImageUrl(tokenAddress),
  }

  // TODO: add to tokenList?

  return token
}

interface BaseParams {
  networkId: number
  tokenListApi: TokenList
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
}

interface TokenFromExchangeByAddressParams extends BaseParams {
  tokenAddress: string
}

export async function getTokenFromExchangeByAddress(
  params: TokenFromExchangeByAddressParams,
): Promise<TokenDetails | null> {
  const { tokenAddress, networkId, tokenListApi, exchangeApi, erc20Api } = params

  const tokens = tokenListApi.getTokens(networkId)

  // Try from our current list of tokens, by address
  let token = getToken('address', tokenAddress, tokens)
  if (token) {
    return token
  }

  let tokenId: number
  try {
    tokenId = await exchangeApi.getTokenIdByAddress(tokenAddress)
  } catch (e) {
    log('Token with address %s not registered on contract', tokenAddress, e)
    return null
  }

  // Try from our current list of tokens, by id
  token = getToken('id', tokenId, tokens)
  if (token) {
    return { ...token, address: tokenAddress }
  }

  // Not there, get it from the ERC20 contract
  return getTokenFromErc20({ tokenAddress, tokenId, erc20Api })
}

interface TokenFromExchangeByIdParams extends BaseParams {
  tokenId: number
}

export async function getTokenFromExchangeById(params: TokenFromExchangeByIdParams): Promise<TokenDetails | null> {
  const { tokenId, networkId, tokenListApi, exchangeApi, erc20Api } = params

  const tokens = tokenListApi.getTokens(networkId)

  // Try from our current list of tokens, by id
  let token = getToken('id', tokenId, tokens)
  if (token) {
    return token
  }

  // Not there, get the address from the contract
  let tokenAddress: string
  try {
    tokenAddress = await exchangeApi.getTokenAddressById(tokenId)
  } catch (e) {
    log('Token with id %d not registered on contract', tokenId, e)
    return null
  }

  // Try again from our current list of tokens, by address
  token = getToken('address', tokenAddress, tokens)
  if (token) {
    return { ...token, id: tokenId }
    // TODO: update token list with new id?
  }

  // Not there, get it from the ERC20 contract
  return getTokenFromErc20({ tokenId, tokenAddress, erc20Api })
}
