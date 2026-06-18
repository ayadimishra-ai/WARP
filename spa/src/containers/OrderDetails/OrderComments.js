import React, { Component } from "react";

class OrderComments extends Component {    
    render() {
        return (
            <div className="comment_chat">
                <div className="comment_chat_header">Comments</div>
                <div className="cart_table_top_border"></div>
                <div className="comment_chat_body">
                    <div className="chat_left">
                        <p>{this.props.OrderComments}</p>
                    </div>                    
                </div>                
            </div>
        )
    }
}

export default (OrderComments)