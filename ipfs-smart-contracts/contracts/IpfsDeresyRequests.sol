// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract IpfsDeresyRequests {
    
    struct Review {
      string reviewIpfsHash;
      address reviewer;
      uint8 targetIndex;
    }
    
    struct ReviewRequest {
      address sponsor;
      address[] reviewers;
      string[] targets;
      string formIpfsHash;
      uint256 rewardPerReview;
      Review[] reviews;
      bool isClosed;
      uint256 fundsLeft;
    }
   
    mapping(string => ReviewRequest) private reviewRequests;
    
    // Creating a request
    function createRequest(string memory _name, address[] memory reviewers, string[] memory targets, string memory formIpfsHash, uint256 rewardPerReview) external payable{
        require(reviewers.length > 0,"Deresy: Reviewers cannot be empty");
        require(targets.length > 0,"Deresy: Targets cannot be empty");
        require(rewardPerReview > 0,"Deresy: rewardPerReview must be greater than 0");
        require(msg.value >= (reviewers.length * targets.length * rewardPerReview),"Deresy: msg.value invalid");
        
        reviewRequests[_name].sponsor = msg.sender;
        reviewRequests[_name].reviewers = reviewers;
        reviewRequests[_name].targets = targets;
        reviewRequests[_name].formIpfsHash = formIpfsHash;
        reviewRequests[_name].rewardPerReview = rewardPerReview;
        reviewRequests[_name].isClosed = false;
        reviewRequests[_name].fundsLeft = msg.value;
  }

  function submitReview(string memory _name, uint8 targetIndex, string memory reviewIpfsHash) external {
      require(reviewRequests[_name].isClosed == false,"Deresy: request closed");
      
      if(reviewRequests[_name].fundsLeft < reviewRequests[_name].rewardPerReview){
        revert();
      }
      
      reviewRequests[_name].reviews.push(Review(reviewIpfsHash,msg.sender,targetIndex));
      reviewRequests[_name].fundsLeft -= reviewRequests[_name].rewardPerReview;
      
      payable(msg.sender).transfer(reviewRequests[_name].rewardPerReview);
  }

  function closeReviewRequest(string memory _name) external{
      
      require(msg.sender == reviewRequests[_name].sponsor, "Deresy: Its is not the sponsor");
      require(reviewRequests[_name].isClosed == false,"Deresy: request closed");
      require(reviewRequests[_name].isClosed == true || reviewRequests[_name].isClosed == false, "Deresy: Name does not exist");
      
      payable(reviewRequests[_name].sponsor).transfer(reviewRequests[_name].fundsLeft);
      
      reviewRequests[_name].isClosed = true;
      reviewRequests[_name].fundsLeft = 0;
  }

  function getRequest(string memory _name) public view returns (address[] memory reviewers,string[] memory targets,string memory formIpfsHash,uint256 rewardPerReview,Review[] memory reviews, bool isClosed){
    return (reviewRequests[_name].reviewers,reviewRequests[_name].targets,reviewRequests[_name].formIpfsHash,reviewRequests[_name].rewardPerReview, reviewRequests[_name].reviews, reviewRequests[_name].isClosed);
  }

}