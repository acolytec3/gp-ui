import React, { useState } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

import Form from './Form'
import TokenImg from 'components/TokenImg'
import { RowTokenDiv, RowClaimButton, RowClaimLink } from './Styled'

import useNoScroll from 'hooks/useNoScroll'

import { ZERO } from 'const'
import { formatAmount, formatAmountFull, log } from 'utils'
import { TokenBalanceDetails, Command } from 'types'

export interface RowProps {
  tokenBalances: TokenBalanceDetails
  onSubmitDeposit: (amount: BN) => Promise<void>
  onSubmitWithdraw: (amount: BN) => Promise<void>
  onClaim: Command
  onEnableToken: Command
  innerWidth: number | null
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const { tokenBalances, onSubmitDeposit, onSubmitWithdraw, onClaim, onEnableToken, innerWidth } = props

  const {
    address,
    addressMainnet,
    name,
    image,
    symbol,
    decimals,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable,
    walletBalance,
    enabled,
    highlighted,
    enabling,
    claiming,
  } = tokenBalances
  log('[DepositWidgetRow] %s: %s', symbol, formatAmount(exchangeBalance, decimals))
  const [visibleForm, showForm] = useState<'deposit' | 'withdraw' | void>()
  const exchangeBalanceTotal = exchangeBalance.add(depositingBalance)

  // Checks innerWidth
  let showResponsive = innerWidth < 500
  useNoScroll(visibleForm && showResponsive)

  let className
  if (highlighted) {
    className = 'highlight'
  } else if (enabling) {
    className = 'enabling'
  } else if (visibleForm) {
    className = 'selected'
  }

  const isDepositFormVisible = visibleForm == 'deposit'
  const isWithdrawFormVisible = visibleForm == 'withdraw'

  const _showHideForm = (type?: 'deposit' | 'withdraw' | null): void => {
    if (document && innerWidth < 500) {
      document.body.classList.toggle('noScroll', !!type)
    }

    showForm(type)
  }

  return (
    <>
      <RowTokenDiv data-address={address} className={className} data-address-mainnet={addressMainnet}>
        <div data-label="Token">
          <TokenImg src={image} alt={name} />
          <div>{name}</div>
        </div>
        <div data-label="Exchange Wallet" title={formatAmountFull(exchangeBalanceTotal, decimals)}>
          {formatAmount(exchangeBalanceTotal, decimals)}
        </div>
        <div data-label="Pending Withdrawals" title={formatAmountFull(withdrawingBalance, decimals)}>
          {claimable ? (
            <>
              <RowClaimButton className="success" onClick={onClaim} disabled={claiming}>
                {claiming && <FontAwesomeIcon icon={faSpinner} spin />}
                &nbsp; {formatAmount(withdrawingBalance, decimals)}
              </RowClaimButton>
              <div>
                <RowClaimLink
                  className={claiming ? 'disabled' : 'success'}
                  onClick={(): void => {
                    if (!claiming) {
                      onClaim()
                    }
                  }}
                >
                  <small>Claim</small>
                </RowClaimLink>
              </div>
            </>
          ) : withdrawingBalance.gt(ZERO) ? (
            <>
              <FontAwesomeIcon icon={faClock} />
              &nbsp; {formatAmount(withdrawingBalance, decimals)}
            </>
          ) : (
            0
          )}
        </div>
        <div data-label="Wallet" title={formatAmountFull(walletBalance, decimals)}>
          {formatAmount(walletBalance, decimals)}
        </div>
        <div data-label="Actions">
          {enabled ? (
            <>
              <button onClick={(): void => _showHideForm('deposit')} disabled={isDepositFormVisible}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp; Deposit
              </button>
              <button
                onClick={(): void => _showHideForm('withdraw')}
                disabled={isWithdrawFormVisible}
                className="danger"
              >
                <FontAwesomeIcon icon={faMinus} />
                &nbsp; Withdraw
              </button>
            </>
          ) : (
            <button className="success" onClick={onEnableToken} disabled={enabling}>
              {enabling ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  &nbsp; Enabling {symbol}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  &nbsp; Enable {symbol}
                </>
              )}
            </button>
          )}
        </div>
      </RowTokenDiv>
      {isDepositFormVisible && (
        <Form
          title={
            <>
              Deposit <span className="symbol">{symbol}</span> in Exchange Wallet
            </>
          }
          totalAmountLabel="Wallet balance"
          totalAmount={walletBalance}
          inputLabel="Deposit amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Deposit"
          submitBtnIcon={faPlus}
          onSubmit={onSubmitDeposit}
          onClose={(): void => _showHideForm()}
          responsive={showResponsive}
        />
      )}
      {isWithdrawFormVisible && (
        <Form
          title={
            <>
              Withdraw <span className="symbol">{symbol}</span> from Exchange Wallet
            </>
          }
          totalAmountLabel="Exchange wallet"
          totalAmount={exchangeBalanceTotal}
          inputLabel="Withdraw amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Withdraw"
          submitBtnIcon={faMinus}
          onSubmit={onSubmitWithdraw}
          onClose={(): void => _showHideForm()}
          responsive={showResponsive}
        />
      )}
    </>
  )
}

export default Row
