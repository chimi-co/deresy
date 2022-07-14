const IpfsDeresyRequests = artifacts.require("IpfsDeresyRequests");

module.exports = function (deployer) {
  deployer.deploy(IpfsDeresyRequests);
};
