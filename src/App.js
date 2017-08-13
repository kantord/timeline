import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import _ from 'underscore';
import Papa from 'papaparse'
import createTaskEvent from './taskwarrior.js'
import createJournalEvent from './jrnl.js'
import createAccountingEvent from './ledger.js'




class Day extends Component {
    is_today() {
        return new Date(this.props.day).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()
    }

    render() {
        var date = new Date(this.props.day)
        var formatted_date = (date.getYear() + 1900) + ". " + (date.getMonth() + 1) + ". " + date.getDate() + "."
        var id = this.is_today() ? "today" : null;
        var key = this.props.day;


        var items = this.props.items.sort((a, b) => {
            return b.datetime - a.datetime
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
            {Object.keys(days).sort((a, b) => {
                return new Date(b).getTime() - new Date(a).getTime()
            }).map((day, index) => {
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

        fetch("/accounting.csv").then((response) => {
            return response.text()
        }).then((text) => {
            var parsed = Papa.parse(text).data
            parsed = _.groupBy(parsed, (item) => {return item[0]})

            var items = _.flatten(Object.keys(parsed).map((key) => {
                var transactions = _.groupBy(parsed[key], (item) => {
                    return item[2]
                })

                return Object.keys(transactions).map((x) => {
                    return [key, null, x, transactions[x]]
                })
            }), true)

            this.setState({
                "items": this.state.items.concat(items.map(createAccountingEvent).filter((i) => {return i.visible}))
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
