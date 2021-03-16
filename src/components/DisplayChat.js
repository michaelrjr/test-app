import React from "react";
import { IoIosArrowBack } from "react-icons/io";

export default function DisplayChat(props) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-inline">
          <button className="back" onClick={props.handleCloseChatClick}>
            <IoIosArrowBack />
          </button>
        </div>
        <div className="d-inline ml-5">
          <b>{props.otherUserEmail}</b>
        </div>
        <div className="mt-3">
          {props.chatMessages.map((message) => (
            <div key={message.timestamp} style={{ marginBottom: "10px" }}>
              <div>
                {message.from !== props.currentUser.email && (
                  <div className="other-user-msg">{message.message}</div>
                )}
              </div>
              <div>
                {message.from === props.currentUser.email && (
                  <div className="current-user-msg">{message.message}</div>
                )}
                <button
                  onClick={() =>
                    props.handleDeleteMessageClick(message.message)
                  }
                >
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <br />
        <div>
          <form onSubmit={props.handleSendMessage}>
            <input
              className="form-control"
              type="text"
              placeholder="Enter message"
              value={props.message}
              onChange={props.handleInputBoxChange}
            />
            <button type="submit" className="btn btn-success w-100 mt-3">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
