const Migration = artifacts.require("Migration");

module.exports = (deployer)=>{
    deployer.deploy(Migration);
}