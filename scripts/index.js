import {Connection} from "@solana/web3.js";
import {Wallet, loadKeypair, DriftClient, SpotMarkets, OrderType, PositionDirection} from "@drift-labs/sdk";
import { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

const keyPairFile = "<KEYPAIR_PATH>/keypair.json";;
// const wallet = new Wallet(new Keypair())
const wallet = new Wallet(loadKeypair(keyPairFile))

const driftClient = new DriftClient({
  connection,
  wallet,
  env: 'devnet',
});

console.log('driftClient', driftClient);

await driftClient.subscribe();

const [txSig, userPublickKey] = await driftClient.initializeUserAccount(
  1,
  "test"
);

console.log('txSig', txSig);
console.log('userPublickKey', userPublickKey);

const user = driftClient.getUser();
const users = await driftClient.getUserAccountsForAuthority(new PublicKey("BGx1XuPKQ4vVTViN7ShUV7YizQPpsovPomsN41BB4h6t"));
fs.writeFileSync('userauthority.json', JSON.stringify(users, null, 4));
console.log('User accounts written to userauthority.json');

console.log('user', users);

const publicKey = new PublicKey("BGx1XuPKQ4vVTViN7ShUV7YizQPpsovPomsN41BB4h6t")

const marketIndex = 1; // USDC
const amount = driftClient.convertToSpotPrecision(marketIndex, 0.5); // $10

const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(marketIndex);

// console.log(SpotMarkets["devnet"]);

await driftClient.deposit(
  amount,
  marketIndex,
  publicKey,
  1
);

console.log("deposit successful")

const marketIndex = 1;
const amount = driftClient.convertToSpotPrecision(marketIndex, 0.05);
const associatedTokenAccount = await driftClient.getAssociatedTokenAccount(marketIndex);

await driftClient.withdraw(
  amount,
  marketIndex,
  publicKey,
);

console.log("withdrawal successful")

console.log('current active subaccount', driftClient.activeSubAccountId);
console.log('switching', await driftClient.switchActiveUser(1));
console.log('new active subaccount', driftClient.activeSubAccountId);

// bid for 100 SOL-PERP @ $21.23
const orderParams = {
  orderType: OrderType.LIMIT,
  marketIndex: 0,
  direction: PositionDirection.SHORT,
  baseAssetAmount: driftClient.convertToPerpPrecision(0.02),
  price: driftClient.convertToPricePrecision(121.23),
}
await driftClient.placePerpOrder(orderParams);

console.log("perp order successful")


const marketIndex = 0;
const user =  driftClient.getUser();
await driftClient.settlePNL(
   user.userAccountPublicKey,
   user.getUserAccount(),
   marketIndex
);

console.log('settled pnl')

const spotMarketIndex = 1; // USDC
const spotConfig = SpotMarkets['devnet'][spotMarketIndex];
const spotMarket = driftClient.getSpotMarketAccount(spotMarketIndex);
const spotPosition = driftClient.getSpotPosition(spotMarketIndex);
const tokenAmount = driftClient.getTokenAmount(spotPosition.scaledBalance, spotMarket, spotPosition.balanceType);
console.log('config', driftClient.convertToSpotPrecision(spotMarketIndex, tokenAmount));

console.log('position', spotPosition);
