// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpectraSaaS.sol";

/**
 * @title SpectraNFT
 * @dev Gated NFT minting logic for Spectra subscribers.
 * Interfaces with SpectraSaaS to enforce tier-based access.
 */
contract SpectraNFT is ERC721URIStorage, Ownable {
    error InsufficientTier();
    error AlreadyMintedThisCycle();
    error OnlyNexusCanUpdateMetadata();

    SpectraSaaS public saasContract;
    uint256 private _nextTokenId;

    // Mapping to track the last time a user minted a cycle-limited NFT
    mapping(address => uint256) public lastMintTimestamp;
    
    // Mapping to track which token belongs to which user (for simple dynamic update)
    mapping(address => uint256) public userTokenId;

    event NFTMinted(address indexed user, uint256 tokenId, SpectraSaaS.PlanTier tier);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    constructor(address _saasContract) ERC721("Spectra Subscriber NFT", "SNFT") Ownable(msg.sender) {
        saasContract = SpectraSaaS(_saasContract);
    }

    /**
     * @dev Mints an NFT based on the user's subscription tier.
     * Vector Tier: Static Badge (once per 30 days).
     * Nexus Tier: Dynamic Premium NFT (updateable metadata).
     */
    function mintSubscribedNFT(string calldata tokenURI) external {
        SpectraSaaS.PlanTier tier = saasContract.getUserTier(msg.sender);
        
        if (tier == SpectraSaaS.PlanTier.ALPHA) {
            revert InsufficientTier();
        }

        // Cycle check: Once per 30 days for Vector (Badge)
        if (tier == SpectraSaaS.PlanTier.VECTOR) {
            if (block.timestamp < lastMintTimestamp[msg.sender] + 30 days) {
                revert AlreadyMintedThisCycle();
            }
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        lastMintTimestamp[msg.sender] = block.timestamp;
        userTokenId[msg.sender] = tokenId;

        emit NFTMinted(msg.sender, tokenId, tier);
    }

    /**
     * @dev Updates metadata for Nexus tier users.
     */
    function updatePremiumMetadata(uint256 tokenId, string calldata newURI) external {
        if (ownerOf(tokenId) != msg.sender) revert ("Not owner");
        
        SpectraSaaS.PlanTier tier = saasContract.getUserTier(msg.sender);
        if (tier != SpectraSaaS.PlanTier.NEXUS) {
            revert OnlyNexusCanUpdateMetadata();
        }

        _setTokenURI(tokenId, newURI);
        emit MetadataUpdated(tokenId, newURI);
    }

    /**
     * @dev Admin function to update the SaaS contract address.
     */
    function setSaasContract(address _saasContract) external onlyOwner {
        saasContract = SpectraSaaS(_saasContract);
    }
}
