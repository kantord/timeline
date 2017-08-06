import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import _ from 'underscore';
import BaseEvent from './Event.js'
import Papa from 'papaparse'

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


function createAccountingEvent(item) {
    function extract_datetime(date_string) {
        return new Date(
            date_string.substring(0,4),
            date_string.substring(5,7) - 1,
            date_string.substring(8,10),
        ).getTime()
    }

    if (item[0] === undefined) {
        return {"visible": false}
    }

    if (item[2] === undefined) {
        return {"visible": false}
    }

    var formatted_item = {
        "payee": item[2],
        "datetime": extract_datetime(item[0]),
        "parts": item[3].map((x) => {
            return {
                "account": x[3],
                "currency": x[4],
                "amount": x[5] * 1,
            }
        })
    }

    
    var key = Math.random()

    return {
        "visible": true,
        "datetime": formatted_item.datetime,
        "item": React.createElement(AccountingEvent, {"item": formatted_item, "datetime": formatted_item.datetime, "key": key})
    }
}

class TaskEvent extends BaseEvent {
    render() {
        var button = null
        if (this.props.item.status === "pending") {
            button = (<button>Mark done</button>)
        }

        return (<li><p>{this.format_time(this.props.datetime)}</p> <span className="source">Taskwarrior</span>{this.props.item.description} {button}</li>)
    }
}

class JournalEvent extends BaseEvent {
    render() {
        return (<li><p>{this.format_time(this.props.datetime)}</p> <span className="source">jrnl</span>{this.props.item.title + " " + this.props.item.body} </li>)
    }
}

class AccountingEvent extends BaseEvent {
    get_totals() {
         var groups = _.groupBy(
            this.props.item.parts.filter((item) => {return item.amount > 0}),
            (item) => {return item.currency}
        )

        return _.map(groups, (amounts, currency) => {return {
            "currency": currency,
            "amount": _.reduce(amounts, (a, b) => {
                return a + b.amount
            }, 0)
        }})
    }

    render() {
        return (<li><span className="source">ledger</span>{this.props.item.payee} <ul className="amounts">{this.get_totals().map((x) => {
            return (<li key={x.currency}>{x.currency}{x.amount}</li>)
        })}</ul> </li>)
    }
}

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
