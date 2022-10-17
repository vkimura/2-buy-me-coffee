const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  //Get the contract that we deployed to Goerli
  const contractAddress = "0x182D7324b0d94788658C0a778E63F9cC432513F0";
  const contractABI = abi.abi;
  // const contract = new hre.ethers.Contract(contractAddress, abi.abi, hre.ethers.provider);

  //Get the node connnection and wallet connection
  // const provider = new hre.ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
  const provider = new hre.ethers.providers.AlchemyProvider(
    "goerli",
    process.env.GOERLI_API_KEY
  );

  //Ensure that signer is the SAME address as the original contract deployer
  //or else this script will fail with an error
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  //Instantiate the connected contract with the signer
  const buyMeACoffee = new hre.ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  //Check the starting balance of the contract
  console.log(
    "Current balance of owner before withdraw: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log(
    "Current balance of contract before withdraw: ",
    contractBalance,
    "ETH"
  );

  //Withdraw the balance of the contract if there are any funds
  if (contractBalance !== "0.0") {
    console.log("Withdrawing funds from contract...");
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("No funds to withdraw");
  }

  //Check the ending balance of the contract
  console.log(
    "Current balance of owner after withdraw: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
