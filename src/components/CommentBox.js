import React, { useEffect, useState } from "react";
import { firebase } from "@firebase/app";
import app from "../firebase";
import { useAuth } from "../contexts/AuthContext";


export default function CommentBox(props) {
  const postID = props.postID;
  // const {handlePostComment } = useAuth();
  const {currentUser} = useAuth();
  const [comment, setComment] = useState("");
  const [userData, setUserData] = useState(null);
  const feedCollection = app.firestore().collection("feed");
  var isMounted=false;

  useEffect(() => {
    isMounted=true;
    getUserData();
    return () => isMounted = false;
  }, []);

  function getUserData(){
    app.firestore().collection("Users").doc(currentUser.email).get().then((doc) => {
      if(isMounted) setUserData(doc.data());
    });
  }

  const handlePostComment = (comment, postID, childCommentSectionID) => {
    if (comment.length > 0 && postID) {
      feedCollection.where("postID", "==", postID).get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.exists) {
            doc.ref
              .collection(childCommentSectionID)
              .add({
                comment: comment,
                commentSectionID: childCommentSectionID,
                from: currentUser.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
              })
              .catch((error) => {
                console.error("Error adding document: ", error);
              });
          }
        });
      });
    }
  };

  const handleCommentBoxChange = (e) => {
    setComment(e.target.value);
  };

  useEffect(() => {
    props.scrollToBottomElement();
  }, []);

  return (
    <div className="commentBox">
      <input
        type="text"
        placeholder="Enter comment"
        value={comment}
        onChange={
          handleCommentBoxChange
        }
      />
      <button className="comment-btn btn-primary btn-sm" onClick={() => {
        handlePostComment(comment, postID, props.commentSectionID);
        setComment("");
        props.setShowCommentBox(false);
      }}>
        Post
      </button>
      <button className="comment-btn btn-secondary btn-sm" onClick={() => {
        setComment("");
        props.setShowCommentBox(false);
      }}>
        Cancel
      </button>
    </div>
  );
}
