import React, { Component } from 'react';

import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls';

class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: [],
        outputType: 'list'
    };

    static contextType = AuthContext;

    componentDidMount() {
        this.fetchBookings();
    }
    fetchBookings = () => {
        this.setState({isLoading: true});
        //start call for bookings API
        const requestBody = {
             query: `
               query {
                 bookings {
                   _id
                   createdAt
                   event {
                       _id
                       title
                       date
                       price
                   }
                 }
               }
             `
           };

   //send the values to backend APIs //
       fetch('http://localhost:8000/graphql', {
         method: 'POST',
         body: JSON.stringify(requestBody),
         headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Bearer ' + this.context.token
         }
       })
       .then(res => {
         if (res.status !== 200 && res.status !== 201) {
           throw new Error('Response Status Failed on Query bookings!!')
         }
         return res.json();
       })
       .then(resData => {
         const bookings = resData.data.bookings;
         this.setState({ bookings: bookings, isLoading: false });
       })
       .catch(err => {
         console.log(err);
         this.setState({ isLoading: false });
       });
        //end call for bookings API
    };

 deleteBookingHandler = bookingId => {
     this.setState({ isLoading: true });
     const requestBody = {
          query: `
            mutation CancelBooking($inputId: ID!) {
              cancelBooking(bookingId: $inputId) {
                _id
                title
              }
          }`,
          variables: {
              inputId: bookingId
          }
        };

 //send the values to backend APIs //
    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.context.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Response Status Failed on Cancel bookings!!')
      }
      return res.json();
    })
    .then(resData => {
        this.setState(prevState => {
            const updatedBookings = prevState.bookings.filter(booking => {
                return booking._id !== bookingId;
            });
            return { bookings: updatedBookings, isLoading: false };
        });
    })
    .catch(err => {
      console.log(err);
      this.setState({ isLoading: false });
    });
 };

 changeOutputTypeHandler = outputType => {
     if (outputType === 'list') {
         this.setState({outputType: 'list'});
     } else {
         this.setState({outputType: 'chart'});
     }
 }
  render() {
      let content = <Spinner />;
      if (!this.state.isLoading) {
          content = (
              <React.Fragment>
                <BookingsControls
                    activeOutputType={this.state.outputType}
                    onChange={this.changeOutputTypeHandler}
                    />
                <div>
                    {this.state.outputType === 'list' ?
                        ( <BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
                        ) : (
                        <BookingsChart bookings={this.state.bookings} /> )
                }
                </div>
              </React.Fragment>
          );
      }
    return (
        <React.Fragment>
            {content}
        </React.Fragment>
    );
  }
}

export default BookingsPage;
