import { Component } from 'react'

class BaseEvent extends Component {
    format_time(date) {
        date = new Date(date)

        return date.getHours() + ":" + date.getMinutes()
    }
}


export default BaseEvent
