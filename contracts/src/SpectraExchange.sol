// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SpectraSaaS.sol";

/**
 * @title SpectraExchange
 * @dev Unified exchange router abstraction for Base Sepolia.
 * Enforces SaaS subscription limits on all trade executions.
 */
contract SpectraExchange is Ownable, ReentrancyGuard {
    SpectraSaaS public saasContract;
    IERC20 public mockUSD;

    event SwapExecuted(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event QuotaVerified(address indexed user, uint256 currentCount);

    /**
     * @dev Modifier to verify and record transaction usage via SpectraSaaS.
     */
    modifier enforceQuota(address _user) {
        saasContract.recordTransaction(_user);
        _;
        emit QuotaVerified(_user, 0); // Count is emitted by SaaS contract event
    }

    constructor(address _saasContract, address _mockUSD) Ownable(msg.sender) {
        saasContract = SpectraSaaS(_saasContract);
        mockUSD = IERC20(_mockUSD);
    }

    /**
     * @dev Calculates a trade quote. 
     * In production, this would interface with Base Sepolia liquidity pools (e.g., Uniswap V3).
     */
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        // Placeholder logic: 1:1 swap for mock tokens
        // Real implementation would use an Oracle or Pool quoter
        return amountIn;
    }

    /**
     * @dev Executes an asset swap.
     * Strict quota enforcement ensures user is within their tier's daily limit.
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant enforceQuota(msg.sender) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        // 1. Transfer In (User must have approved this contract)
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "TransferIn failed");

        // 2. Perform Swap Logic (Placeholder)
        uint256 amountOut = amountIn; // Mock 1:1
        require(amountOut >= minAmountOut, "Slippage too high");

        // 3. Transfer Out
        // In a real scenario, this would involve router.exactInputSingle(...)
        // require(IERC20(tokenOut).transfer(msg.sender, amountOut), "TransferOut failed");

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @dev Admin function to update the SaaS contract address.
     */
    function setSaasContract(address _saasContract) external onlyOwner {
        saasContract = SpectraSaaS(_saasContract);
    }

    /**
     * @dev Admin function to update the Mock USD address.
     */
    function updateMockUSD(address _mockUSD) external onlyOwner {
        mockUSD = IERC20(_mockUSD);
    }

    /**
     * @dev Emergency withdrawal for stuck tokens.
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
