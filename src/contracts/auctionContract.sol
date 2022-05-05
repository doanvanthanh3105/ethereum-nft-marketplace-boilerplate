pragma solidity ^0.8.4;

import "github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/ReentrancyGuard.sol";

contract nftAuction is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct bidItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable currentBidder;
        address payable owner;
        uint256 startPrice;
        uint256 currentPrice;
        bool end;
    }

    mapping (uint => bidItem) private idToBidItem;

    event bidItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable seller,
        address payable currentBidder,
        address payable owner,
        uint256 startPrice,
        uint256 currentPrice,
        bool end
    );

    event bidRise (
        address bidder,
        uint256 itemId,
        uint256 newPrice
    );

    event bidEnd (
        uint256 itemId
    );

    function createBidItem (address nftContract, uint256 tokenId, uint256 startPrice ) public payable nonReentrant {
        require(startPrice > 0, "Price must be greater than 0");

            _itemIds.increment();
            uint256 itemId = _itemIds.current();

            idToBidItem[itemId] = bidItem(
                itemId,
                nftContract,
                tokenId,
                payable(msg.sender),
                payable(msg.sender),
                payable(address(0)),
                startPrice,
                0,  
                false
            );

            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

            emit bidItemCreated (
                itemId,
                nftContract,
                tokenId,
                payable(msg.sender),
                payable(msg.sender),
                payable(address(0)),
                startPrice,
                0,
                false
            );

    }

    function riseBid (uint256 itemId) public payable nonReentrant {
        uint256 price;
        if(idToBidItem[itemId].startPrice > idToBidItem[itemId].currentPrice) {
            price = idToBidItem[itemId].startPrice;
        } else {
            price = idToBidItem[itemId].currentPrice;
        }

        require(msg.value > price);

        
        idToBidItem[itemId].currentBidder.transfer(idToBidItem[itemId].currentPrice);
        

        idToBidItem[itemId].currentPrice = msg.value;
        idToBidItem[itemId].currentBidder = payable(msg.sender);
        

        emit bidRise(
            msg.sender,
            itemId,
            msg.value
        );

    }

    function endBid (address nftContract, uint256 itemId ) public nonReentrant {
        address winner = idToBidItem[itemId].currentBidder;
        uint256 tokenId = idToBidItem[itemId].tokenId;
        uint256 currentPrice = idToBidItem[itemId].currentPrice;
        bool end = idToBidItem[itemId].end;
        require(end != true, "This Sale has alredy finnished");
        require(msg.sender == idToBidItem[itemId].seller, "Only seller can end bid");

        
        idToBidItem[itemId].seller.transfer(currentPrice);
        IERC721(nftContract).transferFrom(address(this), winner, tokenId);
        idToBidItem[itemId].owner = payable(winner);
        _itemsSold.increment();
        idToBidItem[itemId].end = true;
        

        emit bidEnd (
            itemId
        );

    }






}