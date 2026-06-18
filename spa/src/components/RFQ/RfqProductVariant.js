import React, { Component } from 'react';
let checkcolor = 0;
let currentvalue = [];
class RfqProductVariant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Color: '',
            Grade: '',
            Size: '',
            allcolumns: [],
            distinctvalue: [],
            defaultselectedtext: "",
            allskucolumns: []
        }
    }
    toTitleCase = (str) => {
        var arr = str.match(/[a-z]+|\d+/gi);
        return arr.map((m, i) => {
            let low = m.toLowerCase();
            low = low.split('').map((s, k) => k == 0 ? s.toUpperCase() : s).join('')
            return low;
        }).join(' ');
    }
    async componentDidMount() {
        checkcolor = 0;
        let currenttext = this.props.variantOptions.filter(item => item.Id == this.props.SelectedSKUGuid).length > 0 ? this.props.variantOptions.filter(item => item.Id == this.props.SelectedSKUGuid)[0].Value : "";
        let alldata = this.props.variantOptions;
        let allsearches = [];
        if (currenttext.includes('|')) {
            allsearches = currenttext.split('|');
        }
        else {
            allsearches.push(currenttext);
        }

        let alldistinctskucolumns = [];
        this.props.variantOptions.map(getcolumn => {
            if (getcolumn.Value.includes("|")) {
                getcolumn.Value.split("|").map(items => {
                    let headingname = items.split(':');
                    if (alldistinctskucolumns.filter(x => x == headingname[0].toString().trim()).length == 0) {
                        alldistinctskucolumns.push(headingname[0].toString().trim())
                    }
                })
            }
            else {
                let headingname = getcolumn.Value.split(':');
                if (alldistinctskucolumns.filter(x => x == headingname[0].toString().trim()).length == 0) {
                    alldistinctskucolumns.push(headingname[0].toString().trim())
                }
            }
        })
        alldistinctskucolumns = alldistinctskucolumns.sort((a, b) => a.toString().toLowerCase().trim() < b.toString().toLowerCase().trim() ? -1 : 1);
        let allskucolumns = []; let finaltext = '';
        allsearches.map((items, index) => {
            let headingname = items.split(':');
            let indexno = 0;
            if ((parseInt(index) + parseInt(1)) < (parseInt(allsearches.length) - parseInt(1))) {
                indexno = (parseInt(index) + parseInt(1));
            }
            else {
                indexno = parseInt(allsearches.length) - parseInt(1);
            }
            finaltext = finaltext + " | " + items.toString().trim();
            if (index <= (parseInt(allsearches.length) - parseInt(1)) && index > 0) {
                if (finaltext.slice(0, 3) == " | ") {
                    finaltext = finaltext.slice(3, finaltext.length);
                }
                if (alldata.filter(item => item.Value.includes(finaltext.toString().trim())).length > 0) {
                    let prop2 = [];
                    let splitvalues = allsearches[indexno].split(':');
                    alldata.filter(item => item.Value.includes(finaltext.toString().trim())).map(nextitems => {
                        let replaceditems = '';
                        if (finaltext != nextitems.Value) {
                            replaceditems = nextitems.Value.replace(finaltext, '');
                        }
                        if (replaceditems.slice(0, 3) == ' | ') {
                            replaceditems = replaceditems.slice(3, replaceditems.length);
                        }
                        else if (replaceditems.slice(0, 2) == '| ') {
                            replaceditems = replaceditems.slice(2, replaceditems.length);
                        }
                        if (replaceditems.includes('|')) {
                            let allsplititem = replaceditems.split('|');
                            allsplititem.map(nextheadingitem => {
                                if (nextheadingitem.includes(splitvalues[0].toString().trim())) {
                                    if (prop2.filter(x => x == nextheadingitem.split(':')[1].toString().trim()).length == 0) {
                                        prop2.push(nextheadingitem.split(':')[1].toString().trim());
                                    }
                                }
                            })
                        }
                        else {
                            if (replaceditems.includes(splitvalues[0].toString().trim())) {
                                if (prop2.filter(x => x == replaceditems.split(':')[1].toString().trim()).length == 0) {
                                    prop2.push(replaceditems.split(':')[1].toString().trim());
                                }
                            }
                        }
                    })
                    prop2 = prop2.sort((a, b) => a.toString().toLowerCase().trim() < b.toString().toLowerCase().trim() ? -1 : 1);
                    allskucolumns.push({ [splitvalues[0].toString().trim()]: prop2 });
                }
            }
            else if (index == 0) {
                if (alldata.filter(item => item.Value.includes(headingname[0].toString().trim())).length > 0) {
                    let prop = [];
                    alldata.filter(item => item.Value.includes(headingname[0].toString().trim())).map(item => {
                        if (item.Value.includes('|')) {
                            let allsplititem = item.Value.split('|');
                            allsplititem.map(nextheadingitem => {
                                if (nextheadingitem.includes(headingname[0])) {
                                    if (prop.filter(x => x == nextheadingitem.split(':')[1].toString().trim()).length == 0) {
                                        prop.push(nextheadingitem.split(':')[1].toString().trim());
                                    }
                                }
                            })
                        }
                        else {
                            if (item.Value.includes(headingname[0])) {
                                if (prop.filter(x => x == item.Value.split(':')[1].toString().trim()).length == 0) {
                                    prop.push(item.Value.split(':')[1].toString().trim());
                                }
                            }
                        }
                    })
                    prop = prop.sort((a, b) => a.toString().toLowerCase().trim() < b.toString().toLowerCase().trim() ? -1 : 1);
                    allskucolumns.push({ [headingname[0].toString().trim()]: prop });
                }
                if (indexno > 0) {
                    let splitvalues = allsearches[indexno].split(':');
                    if (alldata.filter(item => item.Value.includes(items.toString().trim())).length > 0) {
                        let prop1 = [];
                        alldata.filter(item => item.Value.includes(items.toString().trim())).map(item => {
                            if (item.Value.includes('|')) {
                                let allsplititem = item.Value.split('|');
                                allsplititem.map(nextheadingitem => {
                                    if (nextheadingitem.includes(splitvalues[0])) {
                                        if (prop1.filter(x => x == nextheadingitem.split(':')[1].toString().trim()).length == 0) {
                                            prop1.push(nextheadingitem.split(':')[1].toString().trim());
                                        }
                                    }
                                })
                            }
                            else {
                                if (item.Value.includes(splitvalues[0])) {
                                    if (prop1.filter(x => x == item.Value.split(':')[1].toString().trim()).length == 0) {
                                        prop1.push(item.Value.split(':')[1].toString().trim());
                                    }
                                }
                            }
                        })
                        prop1 = prop1.sort((a, b) => a.toString().toLowerCase().trim() < b.toString().toLowerCase().trim() ? -1 : 1);
                        allskucolumns.push({ [splitvalues[0].toString().trim()]: prop1 });
                    }
                }
            }
        })
        let distinctdata = [{ "finaldata": allskucolumns }];
        this.setState({ allcolumns: alldistinctskucolumns, distinctvalue: distinctdata })
        //let allskucolumns = [];
        //let maxcolumns = 0;
        //let allindexing = [];
        //this.props.variantOptions.map(data => {
        //    if (data.Value.includes('|')) {
        //        let allsplitdata = data.Value.split('|');
        //        if (allsplitdata.length > maxcolumns) {
        //            maxcolumns = allsplitdata.length;
        //        }
        //        let searchitem =
        //            allsplitdata.map(item => {
        //                let i = 0;
        //                var prop = [];
        //                let keyvalueitem = item.split(':');
        //                let keyvaluevalue = this.getstatevalue(keyvalueitem[0])
        //                let searchitem = keyvalueitem + ":" + keyvaluevalue
        //                if (allskucolumns.filter(x => x == keyvalueitem[0].toString().trim()).length == 0) {
        //                    allskucolumns.push(keyvalueitem[0].toString().trim())
        //                    alldistinctskucolumns.push(keyvalueitem[0].toString().trim())
        //                    allindexing.push(allskucolumns.indexOf(keyvalueitem[0].toString().trim()))
        //                }
        //                i = allskucolumns.indexOf(keyvalueitem[0].toString().trim());
        //                if (prop.filter(x => x == keyvalueitem[0].toString().trim()).length == 0) {
        //                    prop.push(keyvalueitem[1].toString().trim())
        //                }
        //                allskucolumns.push({ heading: keyvalueitem[0].toString().trim(), ['columns_' + i]: prop });
        //            })
        //    }
        //    else {
        //        let keyvalueitem = data.Value.split(':');
        //        if (allskucolumns.filter(x => x == keyvalueitem[0].toString().trim()).length == 0) {
        //            allskucolumns.push(keyvalueitem[0].toString().trim())
        //        }
        //    }
        //});
        //let finaldata = [];
        //allindexing.map(items => {
        //    let nextcolumnname = 'columns_' + items.toString();
        //    if (allskucolumns.filter(item => item.heading == allskucolumns[items]).length > 0) {
        //        let filterdata = [];
        //        allskucolumns.filter(item => item.heading == allskucolumns[items]).map(item => {
        //            if (item[nextcolumnname][0] != null && item[nextcolumnname][0] != undefined && item[nextcolumnname][0] != "") {
        //                if (filterdata.filter(text => text == item[nextcolumnname][0]).length == 0) {
        //                    filterdata.push(item[nextcolumnname][0]);
        //                }
        //            }
        //        })
        //        finaldata.push({ [allskucolumns[items]]: filterdata });
        //    }
        //})
        //let distinctdata = [{ "finaldata": finaldata }];
        //this.setState({ allcolumns: alldistinctskucolumns, distinctvalue: distinctdata, allskucolumns: allskucolumns })
    }
    async componentDidUpdate() {
        let currenttext = "";
        if (this.props.variantOptions.filter(item => item.Id == this.props.SelectedSKUGuid).length > 0 && checkcolor == 0) {
            this.props.variantOptions.filter(item => item.Id == this.props.SelectedSKUGuid).map(item => {
                if (item.Value.includes('|')) {
                    let allsplitdata = item.Value.split('|');
                    allsplitdata.map(newitem => {
                        let keyvalueitem = newitem.split(':');
                        let variants = this.toTitleCase(keyvalueitem[0].toString().trim());
                        currenttext = currenttext + " | " + [variants] + ":" + keyvalueitem[1].toString().trim();
                        if (currenttext.slice(0, 3) == " | ") {
                            currenttext = currenttext.slice(3, currenttext.length);
                        }
                        this.setState({ [variants]: keyvalueitem[1].toString().trim(), defaultselectedtext: currenttext })
                    })
                }
                else {
                    let keyvalueitem = item.Value.split(':');
                    let variants = this.toTitleCase(keyvalueitem[0].toString().trim());
                    currenttext = variants + ":" + keyvalueitem[1].toString().trim();
                    this.setState({ [variants]: keyvalueitem[1].toString().trim(), defaultselectedtext: currenttext })
                }
            });
            checkcolor = 1;
        }

    }
   
    getstatevalue(item) {
        item = this.toTitleCase(item.toString().trim().replace('"', ''));
        let parameters = this.state[item]
        return parameters;
    }
    render() {
        return (
            this.state.allcolumns.map(heading => {
                let alldetails = (
                    this.state.distinctvalue != "" && this.state.distinctvalue != undefined && this.state.distinctvalue != null ?
                        this.getstatevalue(heading) != undefined && this.getstatevalue(heading) != null ?
                            this.state.distinctvalue[0].finaldata.filter(item => item[heading]).length > 0 ?
                    <React.Fragment>
                        <div className="moq">
                            <div className='prod_variant_selection'>
                                <h5 className='variant_heading'>{heading}</h5>
                                {/*{this.bindmultiplevariant(this.state.distinctvalue, item)}*/}
                                {this.state.distinctvalue != "" && this.state.distinctvalue != undefined && this.state.distinctvalue != null ?
                                    this.state.distinctvalue[0].finaldata.map(item => {
                                        return (<React.Fragment>
                                            <div className='variants'>
                                                {this.getstatevalue(heading) != undefined && this.getstatevalue(heading) != null && item[heading] != undefined ?
                                                    item[heading].map(listitem => {
                                                        let returnvalue = (
                                                            this.getstatevalue(heading) == listitem.toString().trim() ?
                                                                <span  className="selected">{listitem}</span>
                                                                :
                                                                ""// <span>{listitem}</span>
                                                        )
                                                        return returnvalue;
                                                    }) : ""}
                                            </div>
                                        </React.Fragment>)
                                    })
                                    : ""}
                            </div>
                        </div>
                            </React.Fragment>
                                : "" : "" : "")
                return alldetails;
            })
        )
    }
}
export default RfqProductVariant