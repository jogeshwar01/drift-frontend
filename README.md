<h1 align="center"> Drift SDK UI 👾</h1>

<p align="center">
    View subaccounts and deposit/withdraw/trade perp markets on Drift.
    <br />
    <a href="#introduction"><strong>Introduction</strong></a> ·
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#resources"><strong>Resources</strong></a>
</p>

## Introduction

This repository contains a UI to view subaccounts and deposit/withdraw/trade perp markets on Drift. It provides a comprehensive interface for managing Drift Protocol's subaccounts, positions, and trading functionality.

## Features

### Core Features

- **Solana Wallet Integration**: Seamlessly connect and interact with Solana wallets
- **Network Switching**: Easily switch between Solana mainnet and devnet networks
- **Subaccount Management**: View and manage up to 8 subaccounts per wallet
- **Position Tracking**: Monitor balances, perp positions, and open orders for each subaccount
- **Wallet Data Viewing**: Input any wallet address to view its Drift data
- **Deposit/Withdraw**: Manage funds across subaccounts
- **Perpetual Trading**:
  - Market Orders
  - Limit Orders

### Stretch Goals Implemented

- **Take Profit/Stop Loss**: Set automated exit points for positions
- **Scaled Orders**: Execute orders at multiple price levels

## Tech Stack

- [Next.js](https://nextjs.org/) – React framework
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) – State management
- [@drift-labs/sdk](https://github.com/drift-labs/protocol-v2) – Drift Protocol SDK
- [@solana/web3.js](https://github.com/solana-labs/solana-web3.js) – Solana blockchain interaction
- [@solana/wallet-adapter-react](https://github.com/solana-labs/wallet-adapter) – Solana wallet integration

## Demo

##### User Accounts

![drift user accounts](/public/drift-user-accounts.png)

##### Deposit

![drift-deposit](/public/drift-deposit.png)

##### Withdraw

![drift-withdraw](/public/drift-withdraw.png)

##### Perp Trade

![drift-perp-trade](/public/drift-perp-trade.png)

##### Order History

![drift-order-history](/public/drift-order-history.png)

##### View Wallet Data

![drift-view-wallet-data](/public/drift-view-wallet.png)

##### Wallet Adaptor

![drift-wallet-adaptor](/public/drift-wallet-adaptor.png)

##### Default

![drift-default](/public/drift-default.png)

## Getting Started

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd drift-frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```
   NEXT_PUBLIC_MAINNET_RPC_URL=
   NEXT_PUBLIC_DEVNET_RPC_URL=
   NEXT_PUBLIC_BIRDEYE_API_KEY=
   ```

4. Run the development server:
   ```bash
   yarn dev
   ```

## Project Structure

- `src/components/drift/` - Drift-specific components
- `src/store/` - Zustand state management
- `src/app/actions/` - Drift client initialization
- `src/config/` - Environment and configuration

## Key Features Implementation

### Drift Client Initialization

The application initializes the Drift client with the appropriate RPC URL based on the selected network (mainnet/devnet).

### Subaccount Management

- View all subaccounts associated with a wallet
- Track balances and positions for each subaccount
- Switch between subaccounts seamlessly

### Trading Interface

- Place market and limit orders
- Set take profit and stop loss levels
- Execute scaled orders for better position entry/exit

## Resources

- [Drift Protocol Documentation](https://drift-labs.github.io/v2-teacher/)
- [Drift SDK Integration Guide](https://drift-labs.github.io/v2-teacher/#client-initialization)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
