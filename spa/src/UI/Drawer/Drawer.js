import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Close from '@material-ui/icons/Close';
import UserAddress from '../../components/AccountOnboarding/UserAddress'


class CommonDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            right: false,
        }
    }
    componentDidMount() {
        this.setState({
            right: true,
        });
    }
    closeDrawer = () => {
        this.setState({
            right: false,
        });
        this.props.toggleDrawer()
    };

    getdeliverylocations = () => {
        this.props.toggleDrawer()
    };

    render() {
        return (
            <Drawer className='common_drawer' anchor="right" open={this.state.right} onClose={() => this.closeDrawer()}>
                <div>
                    <div className='common_drawer_head'>
                        <h4>{this.props.drawerHeader}</h4>
                        <Close style={{ 'cursor': 'pointer' }} onClick={() => this.closeDrawer()} />
                    </div>
                    <div className='common_drawer_body'>
                        {this.props.pageName === 'add_address' && <UserAddress closeDrawer={() => this.closeDrawer()} pagetype="RFQ" addresslist={this.props.addresslist} companyGuid={localStorage.companyGuid} userId={localStorage.userId} CommentLogs={[]} ManufacturingDetails={this.props.ManufacturingDetails} GotoLocationList={(data) => this.getdeliverylocations()} />}

                    </div>
                </div>
            </Drawer>
        )
    }
}
export default CommonDrawer