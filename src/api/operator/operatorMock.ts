import { GetOrderParams, GetOrdersParams, GetAccountOrdersParams, GetTradesParams, RawOrder, RawTrade } from './types'

import { RAW_ORDER, RAW_TRADE } from '../../../test/data'

export async function getOrder(params: GetOrderParams): Promise<RawOrder> {
  const { orderId } = params

  return {
    ...RAW_ORDER,
    uid: orderId,
  }
}

export async function getOrders(params: GetOrdersParams): Promise<RawOrder[]> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return [order]
}

export async function getAccountOrders(params: GetAccountOrdersParams): Promise<RawOrder[]> {
  const { owner, networkId } = params

  const order = await getOrder({ networkId, orderId: 'whatever' })

  order.owner = owner || order.owner

  return [order]
}

export async function getTrades(params: GetTradesParams): Promise<RawTrade[]> {
  const { owner, orderId } = params

  const trade = { ...RAW_TRADE }
  trade.owner = owner || trade.owner
  trade.orderUid = orderId || trade.orderUid

  return [trade]
}
