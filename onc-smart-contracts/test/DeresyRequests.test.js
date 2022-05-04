const DeresyRequests = artifacts.require('DeresyRequests')
const truffleAssert = require("truffle-assertions")
const { assert } = require('chai')

contract('DeresyRequests', (accounts) => {
  // Start testing variables ----------
  const ownerAddress = accounts[0] // Address that deployed the contract
  const reviewerAddress1 = accounts[1]    
  const reviewerAddress2 = accounts[2]
  const reviewerAddress3 = accounts[3]
  const target1 = "https://gitcoin.co/grants/4024/refi-podcast-season-one"
  const target2 = "https://gitcoin.co/grants/4912/regens-unite-conference-brussels-2022"
  const rewardPerReview1 = "10000000000000000"
  // End testing variables ----------

  // Load contract
  before(async ()=> {            
    deresyRequests = await DeresyRequests.new()
  })

  // Create Review Form ----------
  describe('Create Review Form', async () => {
    it("should create a review form if data is correct", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await truffleAssert.passes(deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 }))
      let formsCount = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })
      let reviewForm = await deresyRequests.getReviewForm(formsCount - 1)
      assert.deepEqual(questionsArray, reviewForm[0])
      assert.deepEqual(questionTypesArray, reviewForm[1].map( b => { return b.toNumber() }))
    })

    it("should revert if questions array is empty", async () => {
      let questionsArray = []
      let questionTypesArray = [0, 1]
      await truffleAssert.reverts(deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 }))
    })

    it("should revert if questionTypes array is empty", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = []
      await truffleAssert.reverts(deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 }))
    })

    it("should revert if questions and questionTypes arrays have different lengths", async () => {
      let questionsArray = ["Q1", "Q2","Q3"]
      let questionTypesArray = [0, 1]
      await truffleAssert.reverts(deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 }))
    })

    it("should increment reviewFormsTotal value each time a new form is created", async () => {
      let formsCount = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      for (let i = 0; i < 5; i++) {
        await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
        formsCount += 1
        let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })
        assert.equal(reviewFormsTotal, formsCount)
      }
    })
  })

  // Create Review Request ----------
  describe('Create Review Request', async () => {
    it("should create a review request if data is correct", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC1"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await truffleAssert.passes(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
      let request = await deresyRequests.getRequest(requestName)
      assert.deepEqual(request.reviewers, reviewersArray)
      assert.deepEqual(request.targets, targetsArray)
      assert.equal(request.formIpfsHash, ipfsHash)
      assert.equal(request.rewardPerReview, rewardPerReview1)
      assert.equal(request.reviewFormIndex.toNumber(), reviewFormIndex)
      assert.equal(request.reviews, 0)
      assert.equal(request.isClosed, false)
    })

    it("should revert if addresses array is null", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC2"
      let reviewersArray = []
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1

      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1  * targetsArray.length }))
    })

    it("should revert if targets array is null", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC3"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = []
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1

      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length }))
    })

    it("should revert if reviewFormIndex is invalid", async () => {
      let requestName = "RRC4"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = 100000

      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
    })

    it("should revert if rewardPerReview <= 0", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC5"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1

      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, 0, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
    })

    it("should revert if name is duplicated", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC6"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      
      await truffleAssert.passes(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
    })

    it("should revert if msg.value is invalid", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC7"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1

      await truffleAssert.reverts(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 }))
    })

    it("should pass if ipfsHash is empty", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRC8"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = ""
      let reviewFormIndex = reviewFormsTotal - 1
      
      await truffleAssert.passes(deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length }))
    })
  })

  // Close Review Request ----------
  describe('Close Review Request', async () => {
    it("should close a review request if data is correct", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "CRR1"
      let reviewersArray = [reviewerAddress1, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      
      await truffleAssert.passes(deresyRequests.closeReviewRequest(requestName, { from: ownerAddress, value: 0 }))
      let request = await deresyRequests.getRequest(requestName)
      assert.equal(request.isClosed, true)
    })

    it("should revert if sender is not owner", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "CRR2"
      let reviewersArray = [reviewerAddress1, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      
      await truffleAssert.reverts(deresyRequests.closeReviewRequest(requestName, { from: reviewerAddress1, value: 0 }))
      let request = await deresyRequests.getRequest(requestName)
      assert.equal(request.isClosed, false)
    })

    it("should revert if is closed", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "CRR3"
      let reviewersArray = [reviewerAddress1, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      deresyRequests.closeReviewRequest(requestName, { from: ownerAddress, value: 0 })
      
      await truffleAssert.reverts(deresyRequests.closeReviewRequest(requestName, { from: ownerAddress, value: 0 }))
      let request = await deresyRequests.getRequest(requestName)
      assert.equal(request.isClosed, true)
    })
  })

  // Submit Review ----------
  describe('Submit Review', async () => {
    it("should submit reviews if data is correct", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRS1"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      
      for (let i = 0; i < reviewersArray.length; i++) {
        for (let j = 0; j < targetsArray.length; j++) {
          let answersArray = ["Answer 1", "Yes"]
          await truffleAssert.passes(deresyRequests.submitReview(requestName, j, answersArray, { from: reviewersArray[i], value: '0' }))
        }
      }

      let request = await deresyRequests.getRequest(requestName)
      assert.equal(request.reviews.length, targetsArray.length * reviewersArray.length)
    })

    it("should revert if reviewer submits review 2 times for the same target", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRS2"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      
      let targetIndex = 0
      let answersArray = ["Answer 1", "Yes"]
      await truffleAssert.passes(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress1, value: '0' }))
      await truffleAssert.passes(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress2, value: '0' }))
      await truffleAssert.reverts(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress1, value: '0' }))
    })

    it("should revert if submit address is not a reviewer", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRS3"
      let reviewersArray = [reviewerAddress1, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      
      let targetIndex = 0
      let answersArray = ["Answer 1", "Yes"]
      await truffleAssert.reverts(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress2, value: '0' }))
    })

    it("should revert if review request is closed", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRS4"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      await deresyRequests.closeReviewRequest(requestName, { from: ownerAddress, value: 0 })

      let targetIndex = 0
      let answersArray = ["Answer 1", "Yes"]
      await truffleAssert.reverts(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress1, value: '0' }))
    })

    it("should revert if review targetIndex is invalid", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })

      let requestName = "RRS5"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })

      let targetIndex = 10
      let answersArray = ["Answer 1", "Yes"]
      await truffleAssert.reverts(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress1, value: '0' }))
    })
    
    it("should revert if answersArray length is different from review form questionsArray", async () => {
      let questionsArray = ["Q1", "Q2"]
      let questionTypesArray = [0, 1]
      await deresyRequests.createReviewForm(questionsArray, questionTypesArray, { from: ownerAddress, value: 0 })
      let reviewFormsTotal = await deresyRequests.reviewFormsTotal().then(b => { return b.toNumber() })
  
      let requestName = "RRS6"
      let reviewersArray = [reviewerAddress1, reviewerAddress2, reviewerAddress3]
      let targetsArray = [target1, target2]
      let ipfsHash = "hash"
      let reviewFormIndex = reviewFormsTotal - 1
      
      await deresyRequests.createRequest(requestName, reviewersArray, targetsArray, ipfsHash, rewardPerReview1, reviewFormIndex, { from: ownerAddress, value: rewardPerReview1 * reviewersArray.length * targetsArray.length })
      await deresyRequests.closeReviewRequest(requestName, { from: ownerAddress, value: 0 })
  
      let targetIndex = 0
      let answersArray = ["Answer 1", "Yes", "Answer2", "Yes", "Answer 3"]
      await truffleAssert.reverts(deresyRequests.submitReview(requestName, targetIndex, answersArray, { from: reviewerAddress1, value: '0' }))
    })
  })
})