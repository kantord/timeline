import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';


function createTaskEvent(item) {
    function extract_day(item) {
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
        ).getTime() * 1
    }

    return {
        "day": extract_day(item),
        "visible": item.status === "pending" || item.status === "completed",
        "item": React.createElement(TaskEvent, {"item": item, "day": extract_day(item)})

    }
}

class TaskEvent extends Component {
    render() {
        var that = this;

        if (this.props.item.status === "pending") {
            var button = (<button>Mark done</button>)
        } else {
            var button = null
        }

        return (<li key={this.props.item.uuid}><p>{new Date(this.props.day).toLocaleTimeString()}</p>{this.props.item.description} {button}</li>)
    }
}

class Day extends Component {
    render() {
        var that = this;
        console.log(this.props)
        var formatted_date = new Date(this.props.day).toLocaleDateString();
        var anchors = null
        if (formatted_date === new Date(Date.now()).toLocaleDateString()) {
            anchors = (<a id="today" />)
        }


        var key = this.props.day;

        console.log(this.props)

        var items = this.props.items.sort((i) => {
            return new Date(i.day).getTime()
        }).map((i) => {
            return i.item
        })

        return React.createElement("li", {"key": key}, [
            (<p>{anchors}{formatted_date}</p>),
            React.createElement("ul", null, items)
        ])
    }
}

class DayList extends Component {
    organize_items(items) {
        var days = {}
        if (items !== null) {
            items.map((item) => {
                var day = new Date(item.day * 1).toLocaleDateString();
                console.log(new Date(day))
                if (!days.hasOwnProperty(day)) days[day] = [];
                days[day].push(item)
            })
        }

        return days;
    }

    render() {
        var that = this;
        var days = this.organize_items(this.props.items)
    
        if (this.props.items) {
            return (
                <div className="plate">
                <ul>
                    {Object.keys(days).sort().reverse().map((day, index) => {
                        var date = new Date(day * 1)
                        return (<Day key={day} day={day} items={days[day]} onClick={that.props.onClick} />)
                    })}
                </ul>
                </div>
            )
        } else {
            return (
                <div className="plate">
                    <p>Loading...</p>
                </div>
            )
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

        //fetch("/journal.json").then((response) => {
            //return response.json()
        //}).then((json) => {
            //this.setState({
                //"items": this.state.items.concat([])  // FIXME
            //})
        //})
    }

    clickDayListItem(item) {
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
