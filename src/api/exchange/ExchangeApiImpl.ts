import { DepositApiImpl } from './DepositApiImpl'
import { PlaceOrderParams, Receipt, TxOptionalParams, AuctionElement } from 'types'
import { log, decodeAuctionElements } from 'utils'
import Web3 from 'web3'

export interface ExchangeApi extends DepositApiImpl {
  getOrders(userAddress: string): Promise<AuctionElement[]>
  getNumTokens(): Promise<number>
  getFeeDenominator(): Promise<number>
  getTokenAddressById(tokenId: number): Promise<string> // tokenAddressToIdMap
  getTokenIdByAddress(tokenAddress: string): Promise<number>
  addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  cancelOrder(
    { senderAddress, orderId }: { senderAddress: string; orderId: number },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt>
}

/**
 * Basic implementation of Stable Coin Converter API
 */
export class ExchangeApiImpl extends DepositApiImpl implements ExchangeApi {
  public constructor(web3: Web3) {
    super(web3)
    ;(window as any).exchange = this._contractPrototype
  }

  public async getOrders(userAddress: string): Promise<AuctionElement[]> {
    const contract = await this._getContract()
    log(`[ExchangeApiImpl] Getting Orders for account ${userAddress}`)

    const encodedOrders = await contract.methods.getEncodedUserOrders(userAddress).call()

    // is null if Contract returns empty bytes
    if (!encodedOrders) return []

    return decodeAuctionElements(encodedOrders)
  }

  public async getNumTokens(): Promise<number> {
    const contract = await this._getContract()
    const numTokens = await contract.methods.numTokens().call()
    return +numTokens
  }

  /**
   * Fee is 1/fee_denominator.
   * i.e. 1/1000 = 0.1%
   */
  public async getFeeDenominator(): Promise<number> {
    const contract = await this._getContract()
    const feeDenominator = await contract.methods.FEE_DENOMINATOR().call()
    return +feeDenominator
  }

  public async getTokenAddressById(tokenId: number): Promise<string> {
    const contract = await this._getContract()
    return contract.methods.tokenIdToAddressMap(tokenId).call()
  }

  public async getTokenIdByAddress(tokenAddress: string): Promise<number> {
    const contract = await this._getContract()
    const tokenId = await contract.methods.tokenAddressToIdMap(tokenAddress).call()
    return +tokenId
  }

  public async addToken(tokenAddress: string, txOptionalParams?: TxOptionalParams): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.addToken(tokenAddress).send()

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[ExchangeApiImpl] Added Token ${tokenAddress}`)

    return tx
  }

  public async placeOrder(orderParams: PlaceOrderParams, txOptionalParams?: TxOptionalParams): Promise<Receipt> {
    const { userAddress, buyTokenId, sellTokenId, validUntil, buyAmount, sellAmount } = orderParams

    const contract = await this._getContract()

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = contract.methods
      .placeOrder(buyTokenId, sellTokenId, validUntil, buyAmount.toString(), sellAmount.toString())
      .send({ from: userAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(
      `[ExchangeApiImpl] Placed Order to 
      SELL ${sellAmount.toString()} tokenId ${sellTokenId} for ${buyAmount.toString()} tokenId ${buyTokenId}
      order valid until ${validUntil}
      `,
    )

    return tx
  }

  public async cancelOrder(
    { senderAddress, orderId }: { senderAddress: string; orderId: number },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const contract = await this._getContract()
    const tx = contract.methods.cancelOrders([orderId]).send({ from: senderAddress })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    log(`[ExchangeApiImpl] Cancelled Order ${orderId}`)

    return tx
  }
}

export default ExchangeApiImpl
