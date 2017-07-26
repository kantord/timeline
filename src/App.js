import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';


function createTaskEvent(item) {
    function extract_day(item) {
        var day
        if (item.status === "pending") day = item.due
        else if (item.status === "completed") day = item.modified
        else return
        day = (day + "").substring(0, 8)
        return new Date(day.substring(0,4), day.substring(4,6) - 1, day.substring(6,8) - 1).getTime() * 1
    }

    return {
        "day": extract_day(item),
        "visible": item.status === "pending" || item.status === "completed",
        "item": React.createElement(Event, {"item": item})
    }
}

class Event extends Component {
    render() {
        var that = this;

        if (this.props.item.status === "pending") {
            var button = (<button>Mark done</button>)
        } else {
            var button = null
        }

        return (<li key={this.props.item.uuid}>{this.props.item.description} {button}</li>)
    }
}

class Day extends Component {
    render() {
        var that = this;
        var formatted_date = this.props.date.toLocaleDateString()
        var anchors = null
        if (formatted_date === new Date(Date.now()).toLocaleDateString()) {
            anchors = (<a id="today" />)
        }


        var key = this.props.day;

        return React.createElement("li", {"key": key}, [
            (<p>{anchors}{formatted_date}</p>),
            React.createElement("ul", null, this.props.items)
        ])
    }
}

class DayList extends Component {
    organize_items(items) {
        console.log("Items to organize", items)
        var days = {}
        if (items !== null) {
            items.map((item) => {
                var day = item.day
                if (!days.hasOwnProperty(day)) days[day] = [];
                days[day].push(item.item)
            })
        }


        console.log("Organized items", days)

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
                        return (<Day key={day} day={day} date={date} items={days[day]} onClick={that.props.onClick} />)
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
