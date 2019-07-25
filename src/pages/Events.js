import React, { Component } from 'react';

import './Events.css';

class EventsPage extends Component {
  render() {
    return (
      <div className="events-control">
        <p>Please share your Events Information!!</p>
        <button className="btn">Create Event</button>
      </div>
    );
  }
}

export default EventsPage;
