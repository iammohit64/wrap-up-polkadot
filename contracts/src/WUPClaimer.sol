// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWrapUp {
    function userPoints(address user) external view returns (uint256);
}

interface IWUPToken {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract WUPClaimer {
    IWrapUp public immutable wrapUp;
    IWUPToken public immutable wupToken;
    
    uint256 public constant POINTS_TO_TOKEN_RATE = 10 * (10**18); // 1 point = 10 WUP
    
    // BUG FIX: Track how many points have been claimed, not just a boolean
    mapping(address => uint256) public claimedPoints;

    event RewardClaimed(address indexed user, uint256 pointsClaimedThisTx, uint256 tokenAmount);

    constructor(address _wrapUpAddress, address _wupTokenAddress) {
        wrapUp = IWrapUp(_wrapUpAddress);
        wupToken = IWUPToken(_wupTokenAddress);
    }

    function claimReward() external {
        address user = msg.sender;
        
        uint256 totalPoints = wrapUp.userPoints(user);
        require(totalPoints > 0, "No points earned yet");
        
        uint256 alreadyClaimed = claimedPoints[user];
        uint256 claimablePoints = totalPoints - alreadyClaimed;
        
        require(claimablePoints > 0, "No new points to claim");

        uint256 rewardAmount = claimablePoints * POINTS_TO_TOKEN_RATE;
        
        // Update state before external call (Checks-Effects-Interactions pattern)
        claimedPoints[user] = totalPoints;

        bool success = wupToken.transfer(user, rewardAmount);
        require(success, "Token transfer failed");

        emit RewardClaimed(user, claimablePoints, rewardAmount);
    }
}