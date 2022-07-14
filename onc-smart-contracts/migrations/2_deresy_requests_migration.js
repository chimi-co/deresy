const DeresyRequests = artifacts.require("DeresyRequests");

module.exports = function (deployer) {
  deployer.deploy(DeresyRequests);
};
