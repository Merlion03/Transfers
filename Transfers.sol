// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Transfers {
    struct User {
        string login;
        bool admin;
    }
    
    mapping(address => User) public users;
    mapping(string => address) public addresses;
    
    uint adminsNum;
    
    constructor() {
        users[0xe1c99B15bFb7431A2C228B9f1AA7FC44506ED7c8] = User("1", true);
        addresses["1"] = 0xe1c99B15bFb7431A2C228B9f1AA7FC44506ED7c8;
        users[0xf7Af9FB9a14823A50D2A27170938a10E7182b68F] = User("2", true);
        addresses["2"] = 0xf7Af9FB9a14823A50D2A27170938a10E7182b68F;
        
        categories.push("Lichniy perevod");
        categories.push("Oplata arendy zhilya");
        categories.push("Lichniye vzaimorascheti");

        patterns.push(Pattern("Podarok", 0, 10 ether));
        patterns.push(Pattern("Podarok", 0, 3 ether));
        patterns.push(Pattern("Podarok", 0, 5 ether));
        patterns.push(Pattern("Kvartplata", 1, 7 ether));
        patterns.push(Pattern("Kvartplata", 1, 9 ether));
        patterns.push(Pattern("Pogashenie zadolzhennosti", 2, 10 ether));
        
        adminsNum = 2;
    }
    
    function getHash(string memory str) public pure returns(bytes32) {
        return keccak256(bytes(str));
    }
    
    function getAddress(string memory login) public view returns(address) {
        return addresses[login];
    }

    function getBalance(address addr) public view returns(uint) {
        return addr.balance;
    }
    
    function createUser(address addr, string memory login) public {
        require(msg.sender == 0x0516A279fe30508D857443485a1A2E14a384067e, "Not a zero account");
        require(addresses[login] == address(0), "Account with this login already exists");
        users[addr] = User(login, false);
        addresses[login] = addr;
    }
    
    string[] public categories;
    
    function createCategory(string memory name) public admin {
        categories.push(name);
    }
    
    struct Pattern {
        string name;
        uint categoryId;
        uint value;
    }
    
    Pattern[] public patterns;

    function getPatterns() public view returns(Pattern[] memory) {
        return patterns;
    }
    
    function createPattern(string memory name, uint categoryId, uint value) public admin {
        require(getHash(categories[categoryId]) != getHash(""), "Category doesn't exist");
        patterns.push(Pattern(name, categoryId, value));
    }
    
    function usePattern(uint patternId, address toAddress, string memory codeword, string memory description) public payable {
        require(msg.value == patterns[patternId].value, "Invalid value");
        require(msg.sender != toAddress, "You can't transfer to yourself");
        require(getHash(users[toAddress].login) != getHash(""), "Account not registered");
        createTransfer(toAddress, codeword, patterns[patternId].categoryId, description);
    }
    
    struct Transfer {
        address fromAddress;
        address toAddress;
        uint value;
        bytes32 codewordHash;
        uint categoryId;
        string description;
        uint time;
        bool finished;
    }
    
    Transfer[] public transfers;

    function getTransferID() public view returns(uint) {
        return transfers.length - 1;
    }
    
    function createTransfer(address toAddress, string memory codeword, uint categoryId, string memory description) public payable {
        require(msg.value > 0, "Invalid value");
        require(msg.sender != toAddress, "You can't transfer to yourself");
        require(getHash(users[toAddress].login) != getHash(""), "Account not registered");
        require(getHash(categories[categoryId]) != getHash(""), "Category doesn't exist");
        transfers.push(Transfer(msg.sender, toAddress, msg.value, getHash(codeword), categoryId, description, 0, false));
    }
    
    function confirmTransfer(uint transferId, string memory codeword) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].finished == false, "Transfer is already finished");
        require(msg.sender == transfers[transferId].toAddress, "Not for you");
        if (transfers[transferId].codewordHash == getHash(codeword)) {
            payable(msg.sender).transfer(transfers[transferId].value);
            transfers[transferId].time = block.timestamp;
        }
        else {
            payable(transfers[transferId].fromAddress).transfer(transfers[transferId].value);
        }
        transfers[transferId].finished = true;
    }
    
    function cancelTransfer(uint transferId) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].finished == false, "Transfer is already finished");
        require(msg.sender == transfers[transferId].fromAddress, "Not for you");
        payable(msg.sender).transfer(transfers[transferId].value);
        transfers[transferId].finished = true;
    }
    
    modifier admin() {
        require(users[msg.sender].admin == true, "Not admin");
        _;
    }
    
    struct BoostOffer {
        address toBoost;
        address[] yes;
        address no;
        bool status;
    }
    
    BoostOffer public boostOffer;

    function getAddressTooBoost() public view returns(address) {
        return boostOffer.toBoost;
    }
    
    function createBoostOffer(address userAddress) public admin {
        require(boostOffer.status == false, "Vote is already started");
        require(getHash(users[userAddress].login) != getHash(""), "Account not registered");
        require(users[userAddress].admin == false, "Already admin");
        address[] memory yes;
        boostOffer = BoostOffer(userAddress, yes, address(0), true);
    }
    
    modifier checkVote() {
        for (uint i=0; i < boostOffer.yes.length; i++) {
            require(msg.sender != boostOffer.yes[i], "You are already voted");
        }
        _;
    }
    
    function checkBoostOffer() public returns(bool) {
        if (boostOffer.status == false) {
            return false;
        }
        else if (boostOffer.yes.length == adminsNum) {
            users[boostOffer.toBoost].admin = true;
            adminsNum++;
            boostOffer.status = false;
            return true;
        }
        return true;
    }
    
    function voteYes() public admin checkVote {
        require(boostOffer.status == true, "There is no voting going on right now");
        boostOffer.yes.push(msg.sender);
        checkBoostOffer();
    }
    
    function voteNo() public admin checkVote {
        require(boostOffer.status == true, "There is no voting going on right now");
        boostOffer.no = msg.sender;
        boostOffer.status = false;
    }
}
