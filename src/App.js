import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';

class Plate extends Component {
    organize_items(items) {
        var days = {}
        if (items !== null) {
            items.map((item) => {
                var day
                if (item.status === "pending") day = item.due
                else if (item.status === "completed") day = item.modified
                else return
                day = (day + "").substring(0, 8)
                console.log(day)
                day = new Date(day.substring(0,4), day.substring(4,6) - 1, day.substring(6,8) - 1).getTime() * 1
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
                        var formatted_date = new Date(day * 1).toLocaleDateString()
                        var anchors = null
                        if (formatted_date === new Date(Date.now()).toLocaleDateString()) {
                            anchors = (<a id="today" />)
                        }

                        return (<li key={day}>{anchors}{formatted_date}
                            <ul>
                            {days[day].map((item) => {
                            if (item.status === "pending") {
                                var button = (<button onClick={that.props.onClick.bind(null, item)}>Mark done</button>)
                            } else {
                                var button = null
                            }
                            return (<li key={item.uuid}>{item.description} {button}</li>)
                        })}
                            </ul>
                        </li>)
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
            "plate": null
        };

        this.update()
    }

    update() {
        fetch("/plate.json").then((response) => {
            return response.json()
        }).then((json) => {
            this.setState({
                "plate": json
            })
        })
    }

    clickPlateItem(item) {
        console.log(item)
    }

    render() {
        return (
            <div>
                <Plate items={this.state.plate} onClick={this.clickPlateItem} />
            </div>
        );
    }
}

export default App;
