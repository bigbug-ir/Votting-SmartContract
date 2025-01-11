const Votting = artifacts.require("Votting");

module.exports = (deployer)=>{
    deployer.deploy(Votting);
}