// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WrapUp {
    struct Article {
        string ipfsHash;
        address curator;
        uint256 upvoteCount;
        uint256 timestamp;
        bool exists;
        bool isResearch; // <-- New flag for AI reports
    }
    
    struct Comment {
        string ipfsHash;
        uint256 articleId;
        address commenter;
        uint256 upvoteCount;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(uint256 => Article) public articles;
    uint256 public articleCount;
    
    mapping(uint256 => Comment) public comments;
    uint256 public commentCount;
    mapping(uint256 => uint256[]) public articleComments;
    
    mapping(address => uint256) public userPoints;
    mapping(address => mapping(uint256 => bool)) public hasUpvotedArticle;
    mapping(address => mapping(uint256 => bool)) public hasUpvotedComment;
    mapping(address => string) public displayNames;
    
    event ArticleSubmitted(uint256 indexed articleId, string ipfsHash, address indexed curator, bool isResearch, uint256 timestamp);
    event CommentPosted(uint256 indexed articleId, uint256 indexed commentId, string ipfsHash, address indexed commenter, uint256 timestamp);
    event Upvoted(uint256 indexed id, bool isArticle, address indexed voter, address indexed receiver, uint256 newUpvoteCount);
    event PointsAwarded(address indexed user, uint256 pointsEarned, uint256 totalPoints);
    event DisplayNameSet(address indexed user, string displayName);
    
    modifier articleExists(uint256 _articleId) {
        require(articles[_articleId].exists, "Article does not exist");
        _;
    }

    // --- Core Submission ---
    
    function _submit(string memory _ipfsHash, bool _isResearch) internal {
        require(bytes(_ipfsHash).length > 0, "Empty IPFS hash");
        articleCount++;
        articles[articleCount] = Article(_ipfsHash, msg.sender, 0, block.timestamp, true, _isResearch);
        emit ArticleSubmitted(articleCount, _ipfsHash, msg.sender, _isResearch, block.timestamp);
    }

    // For standard links
    function submitArticle(string memory _ipfsHash) external {
        _submit(_ipfsHash, false);
    }

    // For AI Research Engine outputs
    function submitResearchReport(string memory _ipfsHash) external {
        _submit(_ipfsHash, true);
        // Bonus: Submitting heavy AI research could automatically grant 1 point to kickstart it
        userPoints[msg.sender] += 1; 
        emit PointsAwarded(msg.sender, 1, userPoints[msg.sender]);
    }

    // --- Voting & Interactions ---

    function upvoteArticle(uint256 _articleId) external articleExists(_articleId) {
        require(!hasUpvotedArticle[msg.sender][_articleId], "Already upvoted");
        require(articles[_articleId].curator != msg.sender, "Cannot upvote own work");
        
        hasUpvotedArticle[msg.sender][_articleId] = true;
        articles[_articleId].upvoteCount++;
        
        address curator = articles[_articleId].curator;
        // Logic: AI Research upvotes could be worth more points in the future
        uint256 pointsToAward = articles[_articleId].isResearch ? 2 : 1; 
        
        userPoints[curator] += pointsToAward;
        
        emit Upvoted(_articleId, true, msg.sender, curator, articles[_articleId].upvoteCount);
        emit PointsAwarded(curator, pointsToAward, userPoints[curator]);
    }

    function postComment(uint256 _articleId, string memory _ipfsHash) external articleExists(_articleId) {
        require(bytes(_ipfsHash).length > 0, "Empty IPFS hash");
        commentCount++;
        comments[commentCount] = Comment(_ipfsHash, _articleId, msg.sender, 0, block.timestamp, true);
        articleComments[_articleId].push(commentCount);
        emit CommentPosted(_articleId, commentCount, _ipfsHash, msg.sender, block.timestamp);
    }
    
    function upvoteComment(uint256 _commentId) external {
        require(comments[_commentId].exists, "Comment does not exist");
        require(!hasUpvotedComment[msg.sender][_commentId], "Already upvoted");
        require(comments[_commentId].commenter != msg.sender, "Cannot upvote own comment");
        
        hasUpvotedComment[msg.sender][_commentId] = true;
        comments[_commentId].upvoteCount++;
        
        address commenter = comments[_commentId].commenter;
        userPoints[commenter] += 1;
        
        emit Upvoted(_commentId, false, msg.sender, commenter, comments[_commentId].upvoteCount);
        emit PointsAwarded(commenter, 1, userPoints[commenter]);
    }

    // --- Getters & Profile ---
    function setDisplayName(string memory _newName) external {
        require(bytes(_newName).length > 0 && bytes(_newName).length <= 32, "Invalid name length");
        displayNames[msg.sender] = _newName;
        emit DisplayNameSet(msg.sender, _newName);
    }

    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }
    
    function getArticle(uint256 _articleId) external view articleExists(_articleId) returns (Article memory) {
        return articles[_articleId];
    }
}