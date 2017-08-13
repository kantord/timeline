import React from 'react'
import BaseEvent from './Event.js'
import _ from 'underscore';


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
        return (<li style={{"border-left-color": "#03c383"}}>{this.props.item.payee} <ul className="amounts">{this.get_totals().map((x) => {
            return (<li key={x.currency}>{x.currency}{x.amount}</li>)
        })}</ul> <span className="source">ledger</span> </li>)
    }
}

export default createAccountingEvent
