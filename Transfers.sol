// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Transfers {
    struct User {
        string login;
        bytes32 passwordHash;
        bool admin;
    }
    
    mapping(address => User) public users;
    mapping(string => address) public addresses;
    
    uint public adminsNum;
    
    constructor() {
        users[0x794d3bA7A1964508864BF5846a70F6E59BB0Cf50] = User("1", getHash("123"), true);
        users[0xbA3fa41792b14dA93b7BD71b39A1491f131389Ea] = User("2", getHash("123"), true);
        users[0xff1D95a6931B9AB1304776C2D637B582a04e75Ed] = User("3", getHash("123"), false);
        users[0xEb1dae9e4a6fAEFa7a6fc0D97C6bE0Aa9E369DB9] = User("4", getHash("123"), false);
        users[0xA0D179f84F25450eaCEF5f7B54E71149137F1a43] = User("5", getHash("123"), false);
        users[0x17d14B1F8cEad63bD827E7a5bB40E195E260Edf4] = User("6", getHash("123"), false);
        addresses["1"] = 0x794d3bA7A1964508864BF5846a70F6E59BB0Cf50;
        addresses["2"] = 0xbA3fa41792b14dA93b7BD71b39A1491f131389Ea;
        addresses["3"] = 0xff1D95a6931B9AB1304776C2D637B582a04e75Ed;
        addresses["4"] = 0xEb1dae9e4a6fAEFa7a6fc0D97C6bE0Aa9E369DB9;
        addresses["5"] = 0xA0D179f84F25450eaCEF5f7B54E71149137F1a43;
        addresses["6"] = 0x17d14B1F8cEad63bD827E7a5bB40E195E260Edf4;
        adminsNum = 2;
        
        categories.push("Lichniy perevod");
        categories.push("Oplata arendy zhilya");
        categories.push("Lichniye vzaimorascheti");

        patterns.push(Pattern("Podarok", 0, 10 ether));
        patterns.push(Pattern("Podarok", 0, 3 ether));
        patterns.push(Pattern("Podarok", 0, 5 ether));
        patterns.push(Pattern("Kvartplata", 1, 7 ether));
        patterns.push(Pattern("Kvartplata", 1, 9 ether));
        patterns.push(Pattern("Pogashenie zadolzhennosti", 2, 10 ether));
    }
    
    function getHash(string memory str) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    function getBalance(address addr) public view returns(uint) {
        return addr.balance;
    }
    
    function createUser(address addr, string memory password, string memory login) public {
        require(msg.sender == 0x0B041CB4904B6AFC06AeaE63cF1Da9B79226258c, "Not a zero account");
        require(addresses[login] == address(0), "Account with this login already exists");
        users[addr] = User(login, getHash(password), false);
        addresses[login] = addr;
    }
    
    string[] public categories;

    function getCategoryId() public view returns(uint) {
        return categories.length - 1;
    }
    
    function createCategory(string memory name) public admin {
        categories.push(name);
    }
    
    struct Pattern {
        string name;
        uint categoryId;
        uint value;
    }
    
    Pattern[] public patterns;

    function getPatternId() public view returns(uint) {
        return patterns.length - 1;
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
        bool status;
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
        transfers.push(Transfer(msg.sender, toAddress, msg.value, getHash(codeword), categoryId, description, 0, true));
    }
    
    function confirmTransfer(uint transferId, string memory codeword) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].status, "Transfer is not active");
        require(msg.sender == transfers[transferId].toAddress, "Not for you");
        if (transfers[transferId].codewordHash == getHash(codeword)) {
            payable(msg.sender).transfer(transfers[transferId].value);
            transfers[transferId].time = block.timestamp;
        }
        else {
            payable(transfers[transferId].fromAddress).transfer(transfers[transferId].value);
        }
        transfers[transferId].status = false;
    }
    
    function cancelTransfer(uint transferId) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].status, "Transfer is not active");
        require(msg.sender == transfers[transferId].fromAddress, "Not for you");
        payable(msg.sender).transfer(transfers[transferId].value);
        transfers[transferId].status = false;
    }
    
    modifier admin() {
        require(users[msg.sender].admin, "Not admin");
        _;
    }

    function isAdmin() public view returns(bool) {
        if (users[msg.sender].admin) {
            return true;
        }
        return false;
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

    function isVoted() public view returns(bool) {
        for (uint i=0; i < boostOffer.yes.length; i++) {
            if (msg.sender == boostOffer.yes[i]) {
                return true;
            }
        }
        return false;
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
