import React from 'react';
import BaseEvent from './Event.js'


function createInstagramEvent(item) {
    function extract_datetime(item) {
        return item.created_time * 1000;
    }

    return {
        "datetime": extract_datetime(item),
        "visible": item.type === "image",
        "item": React.createElement(InstagramEvent, {"item": item, "datetime": extract_datetime(item), "key": item.id})
    }
}

class InstagramEvent extends BaseEvent {
    render() {
        return (<li style={{"border-left-color": "#8a3ab9"}}><p>{this.format_time(this.props.datetime)}</p> <a href={this.props.item.link}><img className="pic" src={this.props.item.images.low_resolution.url} /></a>  <span className="source">instagram</span></li>)
    }
}

export default createInstagramEvent
