// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract BuyMeCoffee is Ownable {
//     using SafeERC20 for IERC20;

//     IERC20 public token;

//     constructor(IERC20 _token) {
//         token = _token;
//     }

//     function buyMeCoffee() public {
//         token.safeTransferFrom(msg.sender, owner(), 1);
//     }
// }

contract BuyMeACoffee {
    //Event to emit when a Memo is created
    // event MemoCreated(uint256 id, string content, address author);
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    //Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    //Address of contract deployer. Marked payable so that we can withdraw funds to this address.abi
    address payable owner;

    //List of all memos received from cofffe purchases
    Memo[] memos;

    constructor() {
        //Store the address of the deployer as a payable address. When we withdraw funds, we will send them to this address.
        owner = payable(msg.sender);
    }

    /**
     * @dev fetches all stored memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev buy a coffee for owner (sends ETH tip and leaves a memo)
     * @param _name name of the coffee purchaser
     * @param _message message to leave for the owner from coffee purchaser
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        //Must accept more than 0 ETH for a buyCoffee
        require(msg.value > 0, "Must send more than 0 ETH");

        //Add the memo to storage
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        //Emit a NewMemo event with details about the memory
        emit NewMemo(msg.sender, block.timestamp, _name, _message);

        //Emit an event that a new memo has been created
        // emit NewMemo(msg.sender, block.timestamp, _name, _message);
        //Add the memo to the list of memos
        // memos.push(Memo(_name, _message, block.timestamp));
        //Send the ETH tip to the owner
        // owner.transfer(msg.value);
    }

    /**
     * @dev send entire balance stored in this contract to owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }
}
