import React, { Component } from 'react';
import StarRatings from 'react-star-ratings';


class StarAndReviews extends Component { 
  render() {
    return (
      <React.Fragment>        
          <div className={this.props.ClassName}>
            <StarRatings              
              rating={this.props.Ratings}
              isAggregateRating={true}
              starRatedColor="rgb(255, 180, 0)"
              //changeRating={this.changeRating}
              numberOfStars={5}
              name='rating'
              starDimension="22px"
              starSpacing="0px"
            />            
          </div>          
      </React.Fragment>
    )
  }
}
export default (StarAndReviews);