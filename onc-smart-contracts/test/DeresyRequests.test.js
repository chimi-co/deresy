const DeresyRequests = artifacts.require('DeresyRequests')
const truffleAssert = require("truffle-assertions")
const { assert } = require('chai')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('DeresyRequests', (accounts) => {
  // Start testing variables ----------
  const ownerAddress = accounts[0] // Address that deployed the contract
  const reviewerAddress1 = accounts[1]    
  const reviewerAddress2 = accounts[2]
  const reviewerAddress3 = accounts[3]
  // End testing variables ----------

  // Load contract
  before(async ()=> {            
    deresyRequests = await DeresyRequests.new()
  })

  // Create Review Form ----------
  describe('Create Review Form', async () => {
    it("should create a review form if data is correct", async () => {
      await truffleAssert.passes(deresyRequests.createReviewForm(["Q1", "Q2"], [0,1], { from: ownerAddress, value: 0 }))
    })

    it("should revert the review form creation if questions and types arrays have different length", async () => {
      await truffleAssert.fails(deresyRequests.createReviewForm(["Q1"], [0,1], { from: ownerAddress, value: 0 }))
    })
  })

  // Create Review Request ----------
  describe('Create Review Request', async () => {
    it("should create a review request if data is correct", async () => {
      await truffleAssert.passes(deresyRequests.createRequest("Request 1", ["0x4351ccae8fb4d3b3d23ddbb4316e7449a4653c40"], ["Target 1"], "hash", '10000000000000000', 0, { from: ownerAddress, value: '10000000000000000' }))
    })

    /* it("should revert the review request creation if addresses array is null", async () => {
      await truffleAssert.fails(
        await deresyRequests.createRequest("Request 1", [], ["Target 1"], "hash", '10000000000000000', 0, { from: ownerAddress, value: '10000000000000000' })
      )
    })*/
  })
})