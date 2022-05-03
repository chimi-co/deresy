const ARBITRUM_NETWORK_ID = 421611;

const abi = [
  {
    "inputs": [],
    "name": "reviewFormsTotal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "questions",
        "type": "string[]"
      },
      {
        "internalType": "enum DeresyRequests.QuestionType[]",
        "name": "questionTypes",
        "type": "uint8[]"
      }
    ],
    "name": "createReviewForm",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "reviewers",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "targets",
        "type": "string[]"
      },
      {
        "internalType": "string",
        "name": "formIpfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "rewardPerReview",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reviewFormIndex",
        "type": "uint256"
      }
    ],
    "name": "createRequest",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "targetIndex",
        "type": "uint8"
      },
      {
        "internalType": "string[]",
        "name": "answers",
        "type": "string[]"
      }
    ],
    "name": "submitReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "closeReviewRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "getRequest",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "reviewers",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "targets",
        "type": "string[]"
      },
      {
        "internalType": "string",
        "name": "formIpfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "rewardPerReview",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "reviewer",
            "type": "address"
          },
          {
            "internalType": "uint8",
            "name": "targetIndex",
            "type": "uint8"
          },
          {
            "internalType": "string[]",
            "name": "answers",
            "type": "string[]"
          }
        ],
        "internalType": "struct DeresyRequests.Review[]",
        "name": "review",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "reviewFormIndex",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isClosed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_reviewFormIndex",
        "type": "uint256"
      }
    ],
    "name": "getReviewForm",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      },
      {
        "internalType": "enum DeresyRequests.QuestionType[]",
        "name": "",
        "type": "uint8[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getReviewRequestsNames",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

let account;
let web3;
const contractAddress = "0x95ae9d7C5880e684C45925e46Fc49D31bf4eab05";

const handleAccountsChanged = (accounts) => {
  if (accounts.length === 0) {
    document.getElementById("enableMM").innerHTML = "<small>Please connect your wallet</small>";
    document.getElementById("connectBtn").style = "display: block";
  } else if (accounts[0] !== account) {
    account = accounts[0];
      
    if (account != null) {
      document.getElementById("enableMM").innerHTML = `<small>Current account: ${account}</small>`;
      document.getElementById("connectBtn").style = "display: none";
      var pathname = window.location.pathname
      if(pathname == '/get_review_form.html' || pathname == '/create_request.html'){
        populateReviewFormIndexSelect();
      } else if(pathname == '/submit_review.html' || pathname == '/get_request.html' || pathname == '/close_request.html'){
        populateReviewRequestNameSelect();
      }
    } else {
      document.getElementById(
        "enableMM"
      ).innerHTML = "Please connect your wallet";
      document.getElementById("connectBtn").style = "display: block";
    }
  }
};
      
const connect = () => {
  ethereum
  .request({ method: "eth_requestAccounts" })
  .then(handleAccountsChanged)
  .catch((err) => {
    if (err.code === 4001) {
      console.log("Connect please...");
      document.getElementById("enableMM").innerHTML ="<small>You refused to connect</small>";
      document.getElementById("connectBtn").style = "display: block";
    } else {
      console.error(err);
    }
  });
};

const handleNetworkMessage = (chainId) => {
  let networkAlert = document.getElementById("network-info");
  console.log(chainId)
  if(chainId == ARBITRUM_NETWORK_ID) {
    networkAlert.style = "display:none";
  } else {
    networkAlert.style = "display:block"
  }
};
      
const detectMetaMask = () => typeof window.ethereum !== "undefined";
      
window.onload = async function () {
  detectMM = detectMetaMask();
  if (detectMM) {
    document.getElementById("enableMM").getAttribute("disabled", false);
    try {
      web3 = new Web3(window.ethereum);
      await connect();
      ethereum.
      request({ method: "eth_chainId" })
      .then(handleNetworkMessage);
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("enableMM").getAttribute("disabled", true);
  }
        
  document.getElementById("connectBtn").addEventListener("click", connect);
};