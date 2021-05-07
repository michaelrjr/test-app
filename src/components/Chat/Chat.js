import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import app from "../../firebase";
import { firebase } from "@firebase/app";
import DisplayOnlineUsers from "./DisplayOnlineUsers";
import DisplayChat from "./DisplayChat";
import { Link } from "react-router-dom";

export default function Chat() {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [otherUserEmail, setOtherUserEmail] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [otherUserDetails, setOtherUserDetails] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unsub1, setUnsub1] = useState(undefined);
  const [unsub2, setUnsub2] = useState(undefined);
  const [unsub3, setUnsub3] = useState(undefined);
  const [unsub4, setUnsub4] = useState(undefined);
  const [unsub5, setUnsub5] = useState(undefined);
  var isMounted=false;

  //database ref
  const db = app.firestore().collection("conversations");
  const ref = app.firestore().collection("Users");

  useEffect(() => {
    isMounted=true;
    console.log("isMounted: "+isMounted); 
    setUnsub1(() => getOnlineUsers());
    setUnsub2(() => getMembers());
    if (showChat == true) {
      setUnsub3( () => getChatMessages());
    }
    return () => {
      if(unsub1) {unsub1(); console.log("unsub1");}
      if(unsub2) {unsub2(); console.log("unsub2");}
      if(unsub3) {unsub3(); console.log("unsub3");}
      if(unsub4) {unsub4(); console.log("unsub4");}
      if(unsub5) {unsub5(); console.log("unsub5");}
      isMounted=false;
      console.log("isMounted: "+isMounted);
    };
  }, []);

  // query users collection for documents where online == true, these are currently "online" users
  const getOnlineUsers = () => {
    return ref.where("online", "==", true).onSnapshot((querySnapshot) => {
      if(isMounted){
        setOnlineUsers(querySnapshot.docs.map((doc) => doc.data()));
        setIsLoading(false);
      }
    });
  };

  //get all signed up users
  const getMembers = () => {
    return ref.where("email", "!=", null).onSnapshot((querySnapshot) => {
      if(isMounted) setMembers(querySnapshot.docs.map((doc) => doc.data()));
    });
  };

  //search members
  const handleSearch = (event) => {
    setSearchMember(event.target.value);
  };

  // gets the other users document from the users collection
  // and stores that object in an array called otherUsersDetails
  const getOtherUserDetails = (email) => {
    ref
      .doc(email)
      .get()
      .then((doc) => {
        let tempArr = [];
        tempArr.push(doc.data());
        setOtherUserDetails(tempArr);
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  };

  // show chat and also get chat messages from firestore, second param allows for
  //update of message.read field from false to true for the current users received messages
  const handleStartChatClick = (otherEmail, currentEmail) => {
      setOtherUserEmail(otherEmail);
      setShowChat(true);
      setUnsub3(() => getChatMessages(otherEmail));
      setUnsub4(() => setMessageToRead(currentEmail));
      getOtherUserDetails(otherEmail);
  };

  // close chat
  const handleCloseChatClick = () => {
    // console.log(unsub4);
    if(unsub3){
      unsub3();
      console.log("unsub3");
    }
    if(unsub4) {
      unsub4();
      console.log("unsub4");
    }
    setShowChat(false);
  };

  const handleInputBoxChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    db.doc(`${otherUserEmail}`).collection("messages").add({
      message: message,
      from: currentUser.email,
      to: otherUserEmail,
      read: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    db.doc(`${currentUser.email}`).collection("messages").add({
      message: message,
      from: currentUser.email,
      to: otherUserEmail,
      read: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setMessage("");
  };

  // get the chat messages (docs) from current users sub-collection
  const getChatMessages = (email) => {
    console.log("chatMessages before:",chatMessages)
    console.log("Passed email is: "+email);
    console.log("Current user is: "+currentUser.email);
    console.log(`Getting messages from: conversations > ${email} > messages`);
    return db.doc(email)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        console.log(snapshot.docs.map((doc) => doc.data()));
        setChatMessages(snapshot.docs.map((doc) => doc.data()));
      });
  };

  //update read status to true when start chat button is clicked
  const setMessageToRead = (email) => {
    return db.doc(`${email}`)
      .collection("messages")
      .where("to", "==", email)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({ read: true });
          // console.log(doc.data());
        });
      });
  };

  //handle delete
  const handleDeleteMessageClick = (msg) => {
    console.log(msg);
    db.doc(`${currentUser.email}`)
      .collection("messages")
      .where("message", "==", msg)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
    db.doc(`${otherUserEmail}`)
      .collection("messages")
      .where("message", "==", msg)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
  };

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex">
          <strong className="mr-3">
            <h3>Loading..</h3>
          </strong>
          <div className="spinner-border" role="status" aria-hidden="true"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container chat-container p-2">
      {/* {console.log(showChat)} */}
      {showChat == false ? (
        <DisplayOnlineUsers
          members={members}
          chatMessages={chatMessages}
          searchMember={searchMember}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          handleStartChatClick={handleStartChatClick}
          handleSearch={handleSearch}
        />
      ) : null}
      {showChat == true ? (
        <DisplayChat
          otherUserDetails={otherUserDetails}
          currentUser={currentUser}
          chatMessages={chatMessages}
          handleCloseChatClick={handleCloseChatClick}
          handleDeleteMessageClick={handleDeleteMessageClick}
          handleSendMessage={handleSendMessage}
          otherUserEmail={otherUserEmail}
          message={message}
          handleInputBoxChange={handleInputBoxChange}
          handleDeleteMessageClick={handleDeleteMessageClick}
        />
      ) : null}
    </div>
  );
}
