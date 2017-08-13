import React from 'react';
import BaseEvent from './Event.js'


function createJournalEvent(item) {
    function extract_datetime(item) {
        return new Date(
            item.date.substring(0,4),
            item.date.substring(5,7) - 1,
            item.date.substring(8,10) - 1,
            item.time.substring(0, 2),
            item.time.substring(3, 5),
        ).getTime()
    }

    return {
        "datetime": extract_datetime(item),
        "visible": true,
        "item": React.createElement(JournalEvent, {"item": item, "datetime": extract_datetime(item), "key": item.date + item.time + item.title + item.body})
    }
}

class JournalEvent extends BaseEvent {
    render() {
        return (<li><p>{this.format_time(this.props.datetime)}</p> {this.props.item.title + " " + this.props.item.body}  <span className="source">jrnl</span></li>)
    }
}



export default createJournalEvent
