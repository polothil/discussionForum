let commentArr = new Array();
const dummyUsers = ['user1', 'user2', 'user3', 'user4', 'user5'];

// Fetching commentArr(if exists) from localstorage
const defaultLoad = () => {
  let commentsString = localStorage.getItem('commentArr');
  if (commentsString !== null) {
    commentArr = JSON.parse(commentsString);
    for (let i = 0; i < commentArr.length; i++) {
      commentArr[i].lastUpdated = new Date(commentArr[i].lastUpdated); // converting to Date Object
      commentArr[i].upvotes = parseInt(commentArr[i].upvotes); // Converting string to Int
      commentArr[i].downvotes = parseInt(commentArr[i].downvotes); // Converting string to Int
      commentArr[i].childrenIds = JSON.parse(commentArr[i].childrenIds); // converting string back to array form
    }
  }
};

defaultLoad();

document.addEventListener('DOMContentLoaded', (params) => {
  if (commentArr.length) renderComments();

  // Added to get text input enter to replace add button
  const commentInput = document.getElementById('comment');
  commentInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      let content = commentInput.value;
      let name = dummyUsers[Math.floor(Math.random() * 5)];
      addComment(name, content, null);
      commentInput.value = '';
    }
  });

  // Listening to clicks on upvotes, downvotes and reply
  const commentsList = document.getElementById('commentsList');
  commentsList.addEventListener('click', (event) => {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON') {
      let parts = event.target.id.split('-');
      let type = parts[0];
      let id = parts[parts.length - 1];
      let abc = event.target.id.split('reply-')[1];
      if (type == 'reply') {
        let inputElem = `
					<li id="input-${abc}">
					<div>
						<input id="content-${abc}" class="comment-box" placeholder="Reply to discussion...."></input>
					</div>
					</li>
					`;

        let childListElemId = `childlist-${event.target.id.split('reply-')[1]}`;
        let childListElem = document.getElementById(childListElemId);

        if (childListElem == null) {
          childListElem = `<ul id="childlist-${
            event.target.id.split('reply-')[1]
          }"> ${inputElem} </ul>`;
          document.getElementById(`comment-${abc}`).innerHTML += childListElem;
        } else {
          childListElem.innerHTML = inputElem + childListElem.innerHTML;
        }

        // Added to get text input enter to replace add button
        replyId = `content-${abc}`;
        const replyInput = document.getElementById(replyId);
        replyInput.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            let content = replyInput.value;
            let name = dummyUsers[Math.floor(Math.random() * 5)];
            addComment(name, content, id);
          }
        });
      } else if (type == 'upvotes' || type == 'downvotes') {
        commentArr[id][type]++;
        renderComments();
        storeComments();
      }
    }
  });
});

// Storing in local storage
let storeComments = () => {
  // Storing comments in stringified array in local storage
  let val = '[';
  for (let i in commentArr) {
    val += Comment.toJSONString(commentArr[i]);
    i != commentArr.length - 1 ? (val += ',') : (val += '');
  }
  val += ']';
  localStorage.setItem('commentArr', val);
};

let renderComment = (comment) => {
  let id = comment.id;
  let cumVotes = comment.upvotes - comment.downvotes;
  let listElem = `
			<li id="comment-${id}" style="max-width:600px;">
		 	<div class="comment-header">
				<div  class="comment-handle">
					${comment.name}
				</div>
				<div style="color:rgba(0,0,0,0.3);margin-top:10px;">
					${timeAgo(comment.lastUpdated)}
				</div>
			</div> 
			<div>
			 ${comment.content}
			</div>
			<div>
				${comment.upvotes}<a href="#" role="button" id="upvotes-${id}">&and;   </a>
				${comment.downvotes}<a href="#" role="button" id="downvotes-${id}">&or;   </a>
				${cumVotes}<a href="#" id="downvotes-${id}">&#9733;   </a>
				<a href="#" role="button" id="reply-${id}"> reply </a>
			</div>`;
  if (comment.childrenIds.length != 0) {
    listElem += `<ul id="childlist-${id}">`;
    comment.childrenIds.forEach((commentId) => {
      listElem += renderComment(commentArr[commentId]);
    });
    listElem += '</ul>';
  }
  listElem += '</li>';
  return listElem;
};

// Pass parent comment from rootComments to renderComment
let renderComments = () => {
  let rootComments = [];
  commentArr.forEach((comment) => {
    if (comment.parentId === null || comment.parentId == 'null') {
      rootComments.push(comment);
    }
  });
  let commentList = '';
  rootComments.forEach((comment) => {
    commentList += renderComment(comment);
  });
  document.getElementById('commentsList').innerHTML = commentList;
};

// Adding new comment to memory and UI
let addComment = (name, content, parent) => {
  let comment = new Comment(commentArr.length, name, content, 0, 0, parent);
  commentArr.push(comment);
  if (parent != null) {
    commentArr[parent].childrenIds.push(commentArr.length - 1);
  }
  storeComments();
  renderComments();
};

class Comment {
  constructor(id, name, content, upvotes, downvotes, parentId) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.lastUpdated = new Date();
    this.upvotes = upvotes;
    this.downvotes = downvotes;
    this.childrenIds = [];
    this.parentId = parentId;
  }
  static toJSONString(comment) {
    // created JSON string to send/save on server
    return `{
			"id" : "${comment.id}",
			"name" : "${comment.name}",
			"content" : "${comment.content}",
			"upvotes" : "${comment.upvotes}",
			"downvotes" : "${comment.downvotes}",
			"lastUpdated": "${comment.lastUpdated}",
			"parentId": "${comment.parentId}",
			"childrenIds": "${JSON.stringify(comment.childrenIds)}"
		}`;
  }
}

let timeAgo = (date) => {
  let currentDate = new Date();
  let yearDiff = currentDate.getFullYear() - date.getFullYear();

  if (yearDiff > 0) return `${yearDiff} year${yearDiff == 1 ? '' : 's'} ago`;

  let monthDiff = currentDate.getMonth() - date.getMonth();
  if (monthDiff > 0) return `${monthDiff} month${monthDiff == 1 ? '' : 's'} ago`;

  let dateDiff = currentDate.getDate() - date.getDate();
  if (dateDiff > 0) return `${dateDiff} day${dateDiff == 1 ? '' : 's'} ago`;

  let hourDiff = currentDate.getHours() - date.getHours();
  if (hourDiff > 0) return `${hourDiff} hour${hourDiff == 1 ? '' : 's'} ago`;

  let minuteDiff = currentDate.getMinutes() - date.getMinutes();
  if (minuteDiff > 0) return `${minuteDiff} minute${minuteDiff == 1 ? '' : 's'} ago`;

  let secondDiff = currentDate.getSeconds() - date.getSeconds();
  if (secondDiff > 0) return `${secondDiff} second${secondDiff == 1 ? '' : 's'} ago`;

  return `just now`;
};
