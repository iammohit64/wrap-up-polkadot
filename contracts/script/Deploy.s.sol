// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/WrapUp.sol";
import "../src/WUPToken.sol";
import "../src/WUPClaimer.sol";

contract Deploy is Script {
    function run() external {
        // By default, this uses Anvil's Account #0 private key for local testing
        // For real testnets, you will pass your actual private key in the .env file
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY", 
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy WrapUp (The main social/research contract)
        WrapUp wrapUp = new WrapUp();
        console.log("WrapUp deployed to:", address(wrapUp));

        // 2. Deploy WUPToken (The ERC20 Token)
        WUPToken wupToken = new WUPToken(deployer);
        console.log("WUPToken deployed to:", address(wupToken));

        // 3. Deploy WUPClaimer (Needs both previous addresses to link them)
        WUPClaimer claimer = new WUPClaimer(address(wrapUp), address(wupToken));
        console.log("WUPClaimer deployed to:", address(claimer));

        // 4. Mint 1 Million WUP tokens directly to the Claimer contract
        // so that it has funds to pay out to users who claim their points!
        uint256 amountToMint = 1_000_000 * (10**18);
        wupToken.mint(address(claimer), amountToMint);
        console.log("Minted 1,000,000 WUP to the Claimer Contract");

        vm.stopBroadcast();
    }
}