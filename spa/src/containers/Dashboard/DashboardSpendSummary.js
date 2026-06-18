
import React, { Component } from 'react';
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";

class DashboardSpendSummary extends Component {
    constructor(props) {
        super(props)

    }
    render() {
        return (
            <React.Fragment>
                <h5>Spend Summary</h5>
                <ul >
                    <li className="total_summary">
                        <div className="summary_text_cont">
                            <span className="spend_sumary_dollar_icon">$</span>
                            <span className="summary_text">TOTAL SPENDS</span>
                        </div>
                        <div className="summary_amount_cont">
                            <span className="summary_amount_currency">USD</span>
                            <span className="summary_amount_amount">4.37m</span>
                        </div>
                        <div className="prev_summ_compare">
                            <span>
                                <ArrowDownward className="down_arrow" />
                                {/* <ArrowUpward className="up_arrow" /> */}
                            </span>
                            <span>
                                -10% compared to previous (month)
                            </span>
                        </div>
                    </li>
                    <li className="saving_realised">
                        <div className="summary_text_cont">
                            <span className="spend_sumary_dollar_icon">$</span>
                            <span className="summary_text">
                                SAVINGS REALISED</span>
                        </div>
                        <div className="summary_amount_cont">
                            <span className="summary_amount_currency">USD</span>
                            <span className="summary_amount_amount">740780</span>
                        </div>
                        <div className="prev_summ_compare">
                            <span>
                                {/* <ArrowDownward className="down_arrow" /> */}
                                <ArrowUpward className="up_arrow" />
                            </span>
                            <span>
                                30% compared to previous (month)
                            </span>
                        </div>
                    </li>
                    <li className="unrealised_savings">
                        <div className="summary_text_cont">
                            <span className="spend_sumary_dollar_icon">$</span>
                            <span className="summary_text">UNRELAISED SAVINGS</span>
                        </div>
                        <div className="summary_amount_cont">
                            <span className="summary_amount_currency">USD</span>
                            <span className="summary_amount_amount">4.37m</span>
                        </div>
                        <div className="prev_summ_compare">
                            <span>
                                <ArrowDownward className="down_arrow" />
                                {/* <ArrowUpward className="up_arrow" /> */}
                            </span>
                            <span>
                                -10% compared to previous (month)
                            </span>
                        </div>
                    </li>
                    <li className="saving_vis_a_vis_spends">
                        <div className="summary_text_cont">
                            <span className="spend_sumary_dollar_icon">$</span>
                            <span className="summary_text">SAVINGS VIS-A-VIS SPENDS</span>
                        </div>
                        <div className="summary_amount_cont">
                            {/* <span className="summary_amount_currency">USD</span> */}
                            <span className="summary_amount_amount">16%</span>
                        </div>
                        <div className="prev_summ_compare">
                            <span>
                                <ArrowDownward className="down_arrow" />
                                {/* <ArrowUpward className="up_arrow" /> */}
                            </span>
                            <span>
                                -10% compared to previous (month)
                            </span>
                        </div>
                    </li>
                </ul>
            </React.Fragment>
        )
    }
}
export default DashboardSpendSummary