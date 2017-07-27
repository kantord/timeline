import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import _ from 'underscore';


function createTaskEvent(item) {
    function extract_datetime(item) {
        var day
        if (item.status === "pending") day = item.due
        else if (item.status === "completed") day = item.modified
        else return
        return new Date(
            day.substring(0,4),
            day.substring(4,6) - 1,
            day.substring(6,8) - 1,
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

class TaskEvent extends Component {
    render() {
        var button = null
        if (this.props.item.status === "pending") {
            button = (<button>Mark done</button>)
        }

        return (<li><p>{new Date(this.props.datetime).toLocaleTimeString()}</p>{this.props.item.description} {button}</li>)
    }
}

class JournalEvent extends Component {
    render() {
        return (<li><p>{new Date(this.props.datetime).toLocaleTimeString()}</p>{this.props.item.title + " " + this.props.item.body} </li>)
    }
}

class Day extends Component {
    is_today() {
        return new Date(this.props.day).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()
    }

    render() {
        var formatted_date = new Date(this.props.day).toLocaleDateString();
        var id = this.is_today() ? "today" : null;
        var key = this.props.day;


        var items = this.props.items.sort((i) => {
            return new Date(i.day).getTime()
        }).map((i) => {
            return i.item
        })

        return React.createElement("li", {"key": key, "id": id}, [
            (<p key="2">{formatted_date}</p>),
            React.createElement("ul", {"key": 1}, items)
        ])
    }
}

class DayList extends Component {
    organize_items(items) {
        return _.groupBy(items, (item) => {
            return new Date(item.datetime).toLocaleDateString()
        })
    }

    is_loaded() {
        return this.props.items.length > 0
    }

    render_loading() {
        return (
            <div className="plate">
            <p>Loading...</p>
            </div>
        )
    }

    render_loaded(days) {
        return (
            <ul className="DayList">
            {Object.keys(days).sort().reverse().map((day, index) => {
                return (<Day key={day} day={day} items={days[day]}  />)
            })}
            </ul>
        )
    }

    render() {
        var days = this.organize_items(this.props.items)

        if (this.is_loaded()) {
            return this.render_loaded(days)
        } else {
            return this.render_loading()
        }
    }
}


class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            "items": []
        };

        this.update()
    }

    update() {
        fetch("/plate.json").then((response) => {
            return response.json()
        }).then((json) => {
            this.setState({
                "items": this.state.items.concat(json.map(createTaskEvent).filter((i) => {return i.visible}))
            })
        })

        fetch("/journal.json").then((response) => {
            return response.json()
        }).then((json) => {
            this.setState({
                "items": this.state.items.concat(json.entries.map(createJournalEvent).filter((i) => {return i.visible}))
            })
        })
    }

    render() {
        return (
            <div>
                <DayList items={this.state.items} onClick={this.clickDayListItem} />
            </div>
        );
    }
}

export default App;
