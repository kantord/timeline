import React from 'react';
import BaseEvent from './Event.js'

function createTaskEvent(item) {
    function extract_datetime(item) {
        var day
        if (item.status === "pending") day = item.due
        else if (item.status === "completed") day = item.modified
        else return
        return new Date(
            day.substring(0,4),
            day.substring(4,6) - 1,
            day.substring(6,8),
            day.substring(9, 11),
            day.substring(11, 13),
            day.substring(13, 15)
        ).getTime()
    }

    return {
        "datetime": extract_datetime(item),
        "visible": item.status === "pending" || item.status === "completed",
        "item": React.createElement(TaskEvent, {"item": item, "datetime": extract_datetime(item), "key": item.uuid})

    }
}

class TaskEvent extends BaseEvent {
    render() {
        var button = null
        if (this.props.item.status === "pending") {
            button = (<button>Mark done</button>)
        }

        return (<li style={{"border-left-color": "#01545a"}}><p>{this.format_time(this.props.datetime)}</p> {this.props.item.description} {button} <span className="source">Taskwarrior</span></li>)
    }
}

export default createTaskEvent
