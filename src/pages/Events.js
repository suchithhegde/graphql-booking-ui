import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null
  };
 // get Auth token and send it with events API
  static contextType = AuthContext;
  isActive = true;
  constructor(props) {
      super(props);
      this.titleElRef = React.createRef();
      this.priceElRef = React.createRef();
      this.dateElRef = React.createRef();
      this.descriptionElRef = React.createRef();
  }

  componentDidMount() {
      this.fetchEvents();
  }

  startCreateEventhandler = () => {
    this.setState({ creating: true });
  }

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if (title.trim().length === 0 ||
        price <= 0 ||
        date.trim().length === 0  ||
        description.trim().length === 0 ){
            return;
        }
    const event = {title, price, date, description};
    console.log(event);
    //start send to Events API
     const requestBody = {
          query: `
            mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!){
              createEvent(eventInput: {title: $title, description: $desc, date: $date, price: $price}) {
                _id
                title
                description
                date
                price
              }
            }
          `,
          variables: {
              title: title,
              desc: description,
              price: price,
              date: date
          }
        };
const token = this.context.token;
//send the values to backend APIs //
    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Response Status Failed on mutation events!!')
      }
      return res.json();
    })
    .then(resData => {
      this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
              _id: resData.data.createEvent._id,
              title: resData.data.createEvent.title,
              description: resData.data.createEvent.description,
              date: resData.data.createEvent.date,
              price: resData.data.createEvent.price,
              creator: {
                  _id: this.context.userId
              }
          });
          return {events: updatedEvents};
      });
    })
    .catch(err => {
      console.log(err);
    });
    //end send to Events API
  };
  modalCancelHandler = () => {
    this.setState({creating: false, selectedEvent: null });
  };

  fetchEvents() {
      //start send to Events API
      this.setState({isLoading: true});
       const requestBody = {
            query: `
              query {
                events {
                  _id
                  title
                  description
                  date
                  price
                  creator {
                      _id
                      email
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
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Response Status Failed on Query events!!')
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        if (this.isActive) {
            this.setState({ events: events, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
            this.setState({ isLoading: false });
        }
      });
      //end send to Events API
  }

  showDetailHandler = eventId => {
      this.setState(prevState => {
          const selectedEvent = prevState.events.find(e => e._id === eventId);
          return {selectedEvent: selectedEvent};
      })
  }

  bookEventHandler = () => {
      //Start of bookevent API
      if (!this.context.token) {
          this.setState({selectedEvent: null});
          return;
      }
      const requestBody = {
           query: `
             mutation BookEvent($id: ID!){
               bookEvent(eventId: $id) {
                 _id
                 createdAt
                 updatedAt
               }
             }
           `,
           variables: {
               id: this.state.selectedEvent._id
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
         throw new Error('Response Status Failed on Booking events!!')
       }
       return res.json();
     })
     .then(resData => {
       console.log(resData);
       this.setState({selectedEvent: null});
     })
     .catch(err => {
       console.log(err);
     });
      //End of bookevent API
  }
  componentWillUnmount(){
      this.isActive = false;
  }
  render() {
    return (
      <React.Fragment>
       {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
       {this.state.creating && (
    <Modal
            title = "Add Event"
            canCancel
            canConfirm
            onCancel = {this.modalCancelHandler}
            onConfirm = {this.modalConfirmHandler}
            confirmText="Confirm"
            >
            <form>
                <div className="form-control">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" ref={this.titleElRef}></input>
                </div>
                <div className="form-control">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" ref={this.priceElRef}></input>
                </div>
                <div className="form-control">
                    <label htmlFor="date">Date</label>
                    <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                </div>
                <div className="form-control">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" rows="4" ref={this.descriptionElRef}></textarea>
                </div>
            </form>
       </Modal>
     )}

     {this.state.selectedEvent && (
         <Modal
                 title={this.state.selectedEvent.title}
                 canCancel
                 canConfirm
                 onCancel = {this.modalCancelHandler}
                 onConfirm = {this.bookEventHandler}
                 confirmText={this.context.token ? 'Book' : 'Confirm'}
                 >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>

            <p>{this.state.selectedEvent.description}</p>
            </Modal>
     )}
        {this.context.token && (
        <div className="events-control">
          <p>Please share your Events Information!!</p>
          <button className="btn" onClick={this.startCreateEventhandler}>Create Event</button>
        </div>
        )}
        {this.state.isLoading ? (
            <Spinner />
        ) : (
            <EventList
                events={this.state.events}
                authUserId={this.context.userId}
                onViewDetail={this.showDetailHandler}
                />
        )}
      </React.Fragment>
    );
  }
}

export default EventsPage;
