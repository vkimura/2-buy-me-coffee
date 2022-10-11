const hre = require("hardhat");

//returns Ether balance of given address
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

//Logs Ether balances of list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`${address} has ${await getBalance(address)} ETH`);
    idx++;
  }
}

//Logs memos stored on-chain from coffee purchases
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `${timestamp} ${tipper} (${tipperAddress}) tipped with message: ${message}`
    );
  }
  //   const numPurchases = await coffeeContract.numPurchases();
  //   for (let i = 0; i < numPurchases; i++) {
  //     const memo = await coffeeContract.memos(i);
  //     console.log(`Memo ${i}: ${memo}`);
  //   }
}

async function main() {
  //get example accounts we'll be working width:
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  //get contract factory to deploy contract
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  //Deploy contract
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

  //Check balances before the coffee purchase
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("== start == ");
  await printBalances(addresses);

  //Buy owner a few coffees
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee("Caroline", "Thanks for the great tutorial!", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee("Vitto", "Amazing teacher", tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee("Kay", "I love my Proof of Knowledge badge!", tip);

  //Check balances after the coffee purchase
  console.log("== bought coffee == ");
  await printBalances(addresses);

  //Withdraw.
  await buyMeACoffee.connect(owner).withdrawTips();

  //Check balances after the withdrawal
  console.log("== withdrewTips == ");
  await printBalances(addresses);

  //Print memos
  console.log("== memos == ");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
