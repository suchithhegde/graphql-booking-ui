import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Events.css';

class EventsPage extends Component {
  state = {
    creating: false,
    events: []
  };
 // get Auth token and send it with events API
  static contextType = AuthContext;

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
            mutation {
              createEvent(eventInput: {title: "${title}", description: "${description}", date: "${date}", price: ${price}}) {
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
      this.fetchEvents();
    })
    .catch(err => {
      console.log(err);
    });
    //end send to Events API
  };
  modalCancelHandler = () => {
    this.setState({creating: false});
  };

  fetchEvents() {
      //start send to Events API
       const requestBody = {
            query: `
              query {
                events {
                  _id
                  title
                  description
                  date
                  price
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
        console.log(resData);
        const events = resData.data.events;
        this.setState({events: events});
      })
      .catch(err => {
        console.log(err);
      });
      //end send to Events API
  }

  render() {
    const eventList = this.state.events.map(event => {
        return (
            <li key={event._id} className="events__list-item">
                {event.title}
            </li>
        );
    });

    return (
      <React.Fragment>
       {this.state.creating && <Backdrop />}
       {this.state.creating && (
    <Modal
            title = "Add Event"
            canCancel
            canConfirm
            onCancel = {this.modalCancelHandler}
            onConfirm = {this.modalConfirmHandler} >
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
        {this.context.token && (
        <div className="events-control">
          <p>Please share your Events Information!!</p>
          <button className="btn" onClick={this.startCreateEventhandler}>Create Event</button>
        </div>
        )}
        <ul className="events__list">
            {eventList}
        </ul>
      </React.Fragment>
    );
  }
}

export default EventsPage;
